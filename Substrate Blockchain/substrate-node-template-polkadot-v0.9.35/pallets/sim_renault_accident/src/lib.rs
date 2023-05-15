#![cfg_attr(not(feature = "std"), no_std)]

//! Pallet to report an accident at Renault.
//! Aim: report an accident at Renault by sending a data hash. The raw data should be stored elsewhere.
//! NOTE: This pallet is tightly coupled with pallet-sim-renault.
pub use pallet::*;

// #[cfg(test)]
// // mod mock;
// mod parachain;

// #[cfg(test)]
// mod relay_chain;

// #[cfg(test)]
// mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

// pub mod weights;
// pub use weights::WeightInfo;

#[frame_support::pallet]
pub mod pallet {
	use super::*;
	// use cumulus_pallet_xcm::{ensure_sibling_para, Origin as CumulusOrigin};
	// use cumulus_primitives_core::ParaId;
	use frame_support::{
		dispatch::{DispatchError, DispatchResult},
		inherent::Vec,
		pallet_prelude::*,
		weights::Pays,
	};
	use frame_system::{pallet_prelude::*, Config as SystemConfig};
	use log;
	use sha2::{Digest, Sha256};
	// use sp_std::prelude::*;
	// use xcm::latest::prelude::*;

	/// Custom error when retrieving accident data
	#[derive(Clone, Debug, Decode, Encode, Eq, PartialEq, TypeInfo)]
	pub enum GetAccidentDataError {
		/// bad count argument
		GetVehicleAccidentDataBadCount,
		/// accident data doesn't exist
		GetVehicleAccidentDataNotExist,
	}

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config + pallet_sim_renault::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		// /// Weight information for extrinsics in this pallet.
		// type WeightInfo: WeightInfo;

		// type Origin: From<<Self as SystemConfig>::Origin>
		// 	+ Into<Result<CumulusOrigin, <Self as Config>::Origin>>;
		// type XcmSender: SendXcm;
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	// #[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	/// List of accidents.
	/// Accident ID = Hash(vehicle ID + AccidentCount(vehicle ID) )
	/// (
	///    Accident ID => data_hash
	/// )
	#[pallet::storage]
	pub type Accidents<T: Config> =
		StorageMap<_, Blake2_128Concat, [u8; 32], [u8; 36], OptionQuery>;

	/// List of accident count.
	/// (
	///    vehicle ID => accident_count
	/// )
	#[pallet::storage]
	pub type AccidentCount<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, u32, OptionQuery>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event when a accident has been added to storage. AccidentStored(vehicle_id, count, data_hash) [AccidentStored, AccountId, u32, [u8; 32]]
		AccidentStored(T::AccountId, u32, [u8; 36]),
		// /// Generic event when receive a data request from other chain using XCM. ReceiveVehicleDataRequest(para_id, vehicle_id, accident_count)
		// ReceiveVehicleDataRequest(ParaId, T::AccountId, u32),
		// /// Event when sending the data requested from other chain using XCM. AccidentStored(vehicle_id, vehicle_status)
		// SendVehicleDataRequestReply(ParaId, bool),
		// /// Error event when sending the data requested from other chain using XCM
		// ErrorSendVehicleDataRequestReply(ParaId, SendError),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Vehicle is not in storage.
		UnknownVehicle,
		/// Vehicle is already in storage
		AccidentAlreadyStored,
		/// Vehicle ID and origin aren't match
		VehicleNotMatchingOrigin,
		/// Error vehicle status is false
		VehicleStatusError,
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

	#[allow(unused_variables)]
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Report an accident to Renault.
		/// Dispatchable that allows to report an accident and store a data hash associated to the accident.
		// #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
		// #[pallet::weight(<T as pallet::Config>::WeightInfo::report_accident())]
		#[pallet::weight((0, Pays::No))]
		pub fn report_accident(
			origin: OriginFor<T>,
			// vehicle_id: T::AccountId,
			data_hash: [u8; 36],
		) -> DispatchResultWithPostInfo {
			// if_std! {
			// 	println!("{:02x?}", data_hash);
			// }
			let vehicle_id = ensure_signed(origin)?;

			//check if vehicle exists in pallet sim_renault
			ensure!(
				pallet_sim_renault::Pallet::<T>::is_vehicle(vehicle_id.clone()),
				Error::<T>::UnknownVehicle
			);

			//get vehicle accident count
			// let count: u32 = AccidentCount::get(&vehicle_id)?;
			let count: u32 = match <AccidentCount<T>>::get(&vehicle_id) {
				// Return an error if the value has not been set.
				None => 0,
				Some(val) => val,
			};

			//create key from vehicle_id and count
			let mut parts = Vec::new();
			parts.push(vehicle_id.encode());
			parts.push(count.to_le_bytes().to_vec());
			let accident_key: [u8; 32] = Self::create_composite_key(parts);

			// Verify that the specified data_hash has not already been stored.
			ensure!(
				!Accidents::<T>::contains_key(&accident_key),
				Error::<T>::AccidentAlreadyStored
			);

			// Store the data_hash.
			Accidents::<T>::insert(&accident_key, &data_hash);
			// if_std! {
			// 	println!("{:02x?}", accident_key);
			// }

			//inc vehicle accident count
			let next_count = count + 1;
			AccidentCount::<T>::insert(&vehicle_id, next_count);

			// Emit an event.
			Self::deposit_event(Event::AccidentStored(vehicle_id, count, data_hash));
			Ok(().into())
		}

		// /// XCM request data.
		// /// Dispatchable that...
		// #[pallet::weight(0)]
		// pub fn request_data(
		// 	origin: OriginFor<T>,
		// 	vehicle_id: T::AccountId,
		// 	vehicle_accident_count: u32,
		// ) -> DispatchResult {
		// 	// Only accept pings from other chains.
		// 	let orgin_para = ensure_sibling_para(<T as Config>::Origin::from(origin))?;

		// 	Self::deposit_event(Event::ReceiveVehicleDataRequest(
		// 		orgin_para.clone(),
		// 		vehicle_id.clone(),
		// 		vehicle_accident_count.clone(),
		// 	));

		// 	//Test vehicle status
		// 	let vehicle_status: bool =
		// 		pallet_sim_renault::Pallet::<T>::is_vehicle(vehicle_id.clone());
		// 	ensure!(vehicle_status, Error::<T>::VehicleStatusError);

		// 	// Use XCM to send the vehicle data to the Insurance
		// 	// let dest_para = ParaId::from(3000);
		// 	let dest_para = orgin_para.clone(); //just reply to the origin para

		// 	// Get the accident data with a given vehicle id and an accident index
		// 	let data = Self::get_accident_data(vehicle_id.clone(), vehicle_accident_count.clone());

		// 	match data {
		// 		Ok(value) => {
		// 			//if we have found some data
		// 			let call = pallet_sim_insurance_accident::ParaChainCall::<T>::PalletSimInsuranceAccident(
		// 				pallet_sim_insurance_accident::PalletSimInsuranceAccidentCall::ReceiveData(
		// 					vehicle_id.clone(),
		// 					vehicle_accident_count.clone(),
		// 					value.clone()
		// 				)
		// 			);

		// 			// Send the XCM call
		// 			match <T as pallet::Config>::XcmSender::send_xcm(
		// 				(1, Junction::Parachain(dest_para.into())),
		// 				Xcm(vec![Transact {
		// 					origin_type: OriginKind::Native,
		// 					require_weight_at_most: 1_000,
		// 					call: call.encode().into(),
		// 				}]),
		// 			) {
		// 				Ok(result) => {
		// 					Self::deposit_event(Event::<T>::SendVehicleDataRequestReply(
		// 						orgin_para.clone(),
		// 						vehicle_status,
		// 					));
		// 					Ok(())
		// 				},
		// 				Err(e) => {
		// 					log::info!("Send XCM error (sim_renault_accident):\n {:?} \n\n", e);
		// 					Self::deposit_event(Event::ErrorSendVehicleDataRequestReply(
		// 						dest_para,
		// 						e.clone().try_into().unwrap_or(e),
		// 					));
		// 					Err(DispatchError::Other("SendXcmError"))
		// 				},
		// 			}
		// 		},
		// 		Err(e) => {
		// 			log::info!("get_accident_data() error (sim_renault_accident):\n {:?} \n\n", e);
		// 			Err(DispatchError::Other("Can't find data for vehicle"))
		// 		},
		// 	}
		// }
	}

	impl<T: Config> Pallet<T> {
		pub fn create_composite_key(parts: Vec<Vec<u8>>) -> [u8; 32] {
			let concatenated = parts.iter().fold(Vec::new(), |mut res: Vec<u8>, new| {
				res.extend(new.as_slice());
				res
			});
			let mut hasher = Sha256::new();
			Digest::update(&mut hasher, concatenated.as_slice());
			hasher.finalize().into()
		}

		/// Return the data of vehicle
		// The existential deposit is not part of the pot so treasury account never gets deleted.
		pub fn get_accident_data(
			vehicle_id: T::AccountId,
			accident_count: u32,
		) -> Result<[u8; 36], GetAccidentDataError> {
			if accident_count <= 0 {
				return Err(GetAccidentDataError::GetVehicleAccidentDataBadCount)
			} else {
				let new_accident_count = accident_count - 1;
				//create key from vehicle_id and count
				let mut parts = Vec::new();
				parts.push(vehicle_id.encode());
				parts.push(new_accident_count.to_le_bytes().to_vec());
				let accident_key: [u8; 32] = Self::create_composite_key(parts);

				match Accidents::<T>::get(accident_key) {
					Some(data) => Ok(data),
					None => Err(GetAccidentDataError::GetVehicleAccidentDataNotExist),
				}
			}
		}
	}

	/// Module representing pallet sim_renault_accident.
	/// This is used to avoid importing the entire pallet or runtime
	mod pallet_sim_insurance_accident {
		use crate::*;
		use codec::{Decode, Encode};
		use frame_support::RuntimeDebug;

		/// The encoded index correspondes to sim_renault_accident pallet configuration.
		/// Ex: ReceiveData is the second pallet call
		#[derive(Encode, Decode, RuntimeDebug)]
		pub enum PalletSimInsuranceAccidentCall<T: Config> {
			#[codec(index = 1)]
			ReceiveData(T::AccountId, u32, [u8; 36]),
		}

		/// The encoded index correspondes to Insurance's Runtime module configuration.
		/// Ex: PalletSimInsuranceAccident is fixed to the index 103. See the node construct_runtime! macro to view all indexes.
		/// More about indexes here: https://substrate.stackexchange.com/a/1196/501
		#[derive(Encode, Decode, RuntimeDebug)]
		pub enum ParaChainCall<T: Config> {
			#[codec(index = 103)]
			PalletSimInsuranceAccident(PalletSimInsuranceAccidentCall<T>),
		}
	}
}
