#![cfg_attr(not(feature = "std"), no_std)]

//! Pallet for Renault car manufacturer.
//! Aim: Manages Renault's vehicles.
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

// pub mod weights;
// pub use weights::WeightInfo;

#[frame_support::pallet]
pub mod pallet {
	use super::*;
	use frame_support::{dispatch::DispatchResultWithPostInfo, pallet_prelude::*, weights::Pays};
	use frame_system::pallet_prelude::*;

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		// /// Weight information for extrinsics in this pallet.
		// type WeightInfo: WeightInfo;
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	// #[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	/// List of factory IDs added by the admin (sudo).
	/// (
	///    actory ID => block nb
	/// )
	#[pallet::storage]
	pub type Factories<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, T::BlockNumber, OptionQuery>;

	/// List of vehicle ID added by the factories.
	/// (
	///    vehicle ID => (factory ID, block nb)
	/// )
	#[pallet::storage]
	pub type Vehicles<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, (T::AccountId, T::BlockNumber), OptionQuery>;

	/// List of vehicle ID status.
	/// (
	///    vehicle ID => is_initialized
	/// )
	#[pallet::storage]
	pub type VehiclesStatus<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, bool, OptionQuery>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event when a factory has been added to storage. FactoryStored(factory_id) [FactoryStored, AccountId]
		FactoryStored(T::AccountId),
		/// Event when a vehicle has been added to storage by a factory. VehicleStored(vehicle_id, origin) [VehicleStored, AccountId, AccountId]
		VehicleStored(T::AccountId, T::AccountId),
		/// Vehicle is now initialized.  VehicleInitialized(vehicle_id) [CrashStored, AccountId]
		VehicleInitialized(T::AccountId),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Factory is already in storage
		FactoryAlreadyStored,
		/// Factory is not in storage.
		UnknownFactory,
		/// Vehicle is not in storage.
		UnknownVehicle,
		/// Vehicle is already in storage
		VehicleAlreadyStored,
		/// Vehicle and origin aren't match
		VehicleNotMatchingOrigin,
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Create a new factory.
		/// Dispatchable that takes a singles value as a parameter (factory ID), writes the value to
		/// storage (Factories) and emits an event. This function must be dispatched by a signed extrinsic.
		// #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
		// #[pallet::weight(T::WeightInfo::create_factory())]
		#[pallet::weight((0, Pays::No))]
		pub fn create_factory(
			origin: OriginFor<T>,
			factory_id: T::AccountId,
		) -> DispatchResultWithPostInfo {
			ensure_root(origin)?;

			// Verify that the specified factory_id has not already been stored.
			ensure!(!Factories::<T>::contains_key(&factory_id), Error::<T>::FactoryAlreadyStored);

			// Get the block number from the FRAME System module.
			let current_block = <frame_system::Pallet<T>>::block_number();

			// Store the factory_id with the sender and block number.
			Factories::<T>::insert(&factory_id, current_block);

			// Emit an event.
			Self::deposit_event(Event::FactoryStored(factory_id));
			Ok(().into())
		}

		/// Create a new vehicle.
		/// Dispatchable that takes a singles value as a parameter (vehicle ID), writes the value to
		/// storage (Vehicles) and emits an event. This function must be dispatched by a signed extrinsic.
		// #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
		// #[pallet::weight(T::WeightInfo::create_vehicle())]
		#[pallet::weight((0, Pays::No))]
		pub fn create_vehicle(
			origin: OriginFor<T>,
			vehicle_id: T::AccountId,
		) -> DispatchResultWithPostInfo {
			let who = ensure_signed(origin)?;

			// Verify that the specified factory_id exists.
			ensure!(Factories::<T>::contains_key(&who), Error::<T>::UnknownFactory);

			// Verify that the specified car_id has not already been stored.
			ensure!(!Vehicles::<T>::contains_key(&vehicle_id), Error::<T>::VehicleAlreadyStored);

			// Get the block number from the FRAME System module.
			let current_block = <frame_system::Pallet<T>>::block_number();

			// Store the factory_id with the sender and block number.
			Vehicles::<T>::insert(&vehicle_id, (&who, current_block));

			// Emit an event.
			Self::deposit_event(Event::VehicleStored(vehicle_id, who));
			Ok(().into())
		}

		/// Init a vehicle.
		/// Dispatchable that takes a singles value as a parameter (vehicle ID), writes the value to
		/// storage (Factories) and emits an event. This function must be dispatched by a signed extrinsic.
		// #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
		// #[pallet::weight(T::WeightInfo::init_vehicle())]
		#[pallet::weight((0, Pays::No))]
		pub fn init_vehicle(
			origin: OriginFor<T>,
			vehicle_id: T::AccountId,
		) -> DispatchResultWithPostInfo {
			let who = ensure_signed(origin)?;

			// Verify that the origin vehicle exists.
			ensure!(Vehicles::<T>::contains_key(&who), Error::<T>::UnknownVehicle);

			// Verify that the specified vehicle_id matches the origin.
			ensure!(who == vehicle_id, Error::<T>::VehicleNotMatchingOrigin);

			// Set the vehicle as initialized.
			VehiclesStatus::<T>::insert(&vehicle_id, true);

			// Emit an event.
			Self::deposit_event(Event::VehicleInitialized(vehicle_id));
			Ok(().into())
		}
	}

	impl<T: Config> Pallet<T> {
		/// Return status of a vehicle
		// The existential deposit is not part of the pot so treasury account never gets deleted.
		pub fn is_vehicle(vehicle_id: T::AccountId) -> bool {
			let status = VehiclesStatus::<T>::get(&vehicle_id).unwrap_or(false);
			if status == true {
				true
			} else {
				false
			}
		}
	}

		// Next is all the necessary to init the pallet with genesis info

		#[pallet::genesis_config]
		pub struct GenesisConfig<T: Config> {
			/// The `AccountId` of the sudo key.
			pub init_factory_and_vehicle: Option<T::AccountId>,
		}
	
		#[cfg(feature = "std")]
		impl<T: Config> Default for GenesisConfig<T> {
			fn default() -> Self {
				Self { init_factory_and_vehicle: None }
			}
		}
	
		#[pallet::genesis_build]
		impl<T: Config> GenesisBuild<T> for GenesisConfig<T> {
			fn build(&self) {
				if let Some(ref init_factory_and_vehicle) = self.init_factory_and_vehicle {
					Factories::<T>::insert(init_factory_and_vehicle.clone(), <frame_system::Pallet<T>>::block_number());
					Vehicles::<T>::insert(init_factory_and_vehicle.clone(), (init_factory_and_vehicle.clone(), <frame_system::Pallet<T>>::block_number()));
					VehiclesStatus::<T>::insert(init_factory_and_vehicle.clone(), true);
				}
			}
		}
}
