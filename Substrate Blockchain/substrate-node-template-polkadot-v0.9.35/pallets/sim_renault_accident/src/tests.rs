//! tests for pallet using xcm-simulator

mod parachain;
mod relay_chain;

use polkadot_parachain::primitives::Id as ParaId;
use sp_runtime::traits::AccountIdConversion;
use xcm_simulator::{decl_test_network, decl_test_parachain, decl_test_relay_chain};

pub const ALICE: sp_runtime::AccountId32 = sp_runtime::AccountId32::new([0u8; 32]);
pub const INITIAL_BALANCE: u128 = 1_000_000_000;

decl_test_parachain! {
	pub struct ParaA {
		Runtime = parachain::Runtime,
		XcmpMessageHandler = parachain::MsgQueue,
		DmpMessageHandler = parachain::MsgQueue,
		new_ext = para_ext(1),
	}
}

decl_test_parachain! {
	pub struct ParaB {
		Runtime = parachain::Runtime,
		XcmpMessageHandler = parachain::MsgQueue,
		DmpMessageHandler = parachain::MsgQueue,
		new_ext = para_ext(2),
	}
}

decl_test_relay_chain! {
	pub struct Relay {
		Runtime = relay_chain::Runtime,
		XcmConfig = relay_chain::XcmConfig,
		new_ext = relay_ext(),
	}
}

decl_test_network! {
	pub struct MockNet {
		relay_chain = Relay,
		parachains = vec![
			(1, ParaA),
			(2, ParaB),
		],
	}
}

pub fn para_account_id(id: u32) -> relay_chain::AccountId {
	ParaId::from(id).into_account_truncating()
}

pub fn para_ext(para_id: u32) -> sp_io::TestExternalities {
	use parachain::{MsgQueue, Runtime, System};

	let mut t = frame_system::GenesisConfig::default().build_storage::<Runtime>().unwrap();

	pallet_balances::GenesisConfig::<Runtime> { balances: vec![(ALICE, INITIAL_BALANCE)] }
		.assimilate_storage(&mut t)
		.unwrap();

	let mut ext = sp_io::TestExternalities::new(t);
	ext.execute_with(|| {
		System::set_block_number(1);
		MsgQueue::set_para_id(para_id.into());
	});
	ext
}

pub fn relay_ext() -> sp_io::TestExternalities {
	use relay_chain::{Runtime, System};

	let mut t = frame_system::GenesisConfig::default().build_storage::<Runtime>().unwrap();

	pallet_balances::GenesisConfig::<Runtime> {
		balances: vec![(ALICE, INITIAL_BALANCE), (para_account_id(1), INITIAL_BALANCE)],
	}
	.assimilate_storage(&mut t)
	.unwrap();

	let mut ext = sp_io::TestExternalities::new(t);
	ext.execute_with(|| System::set_block_number(1));
	ext
}

pub type RelayChainPalletXcm = pallet_xcm::Pallet<relay_chain::Runtime>;
pub type ParachainPalletXcm = pallet_xcm::Pallet<parachain::Runtime>;

#[cfg(test)]
mod tests {
	use super::*;

	use codec::Encode;
	use frame_support::assert_ok;
	use xcm::latest::prelude::*;
	use xcm_simulator::TestExt;

	// Helper function for forming buy execution message
	fn buy_execution<C>(fees: impl Into<MultiAsset>) -> Instruction<C> {
		BuyExecution { fees: fees.into(), weight_limit: Unlimited }
	}

	#[test]
	fn xcmp() {
		MockNet::reset();

		let remark =
			parachain::Call::System(frame_system::Call::<parachain::Runtime>::remark_with_event {
				remark: vec![1, 2, 3],
			});
		ParaA::execute_with(|| {
			assert_ok!(ParachainPalletXcm::send_xcm(
				Here,
				(Parent, Parachain(2)),
				Xcm(vec![Transact {
					origin_type: OriginKind::SovereignAccount,
					require_weight_at_most: INITIAL_BALANCE as u64,
					call: remark.encode().into(),
				}]),
			));
		});

		ParaB::execute_with(|| {
			use parachain::{Event, System};
			assert!(System::events()
				.iter()
				.any(|r| matches!(r.event, Event::System(frame_system::Event::Remarked { .. }))));
		});
	}
}

// use super::*;
// #[allow(unused_imports)]
// use crate::{mock::*, Error, Event as TestEvent};
// #[allow(unused_imports)]
// use frame_support::{assert_noop, assert_ok, inherent::Vec, traits::IsType};
// #[allow(unused_imports)]
// use sha2::{digest::Update, Digest, Sha256};
// #[allow(unused_imports)]
// use sp_runtime::DispatchError;
// #[allow(unused_imports)]
// use sp_std::if_std;

// #[test]
// fn it_works_for_default_value() {
// 	new_test_ext().execute_with(|| {

// 		//
// 		//Test report_accident() extrinsic
// 		//

// 		//the vehicle id
// 		let vehicle: u64 = 1;
// 		//create data "Hello World" and hash it
// 		let mut hasher = Sha256::new();
// 		sha2::Digest::update(&mut hasher, "Hello World".as_bytes());
// 		let data_hash = hasher.finalize().into();

// 		// create a new accident report
// 		assert_ok!(SimRenaultAccidentPallet::report_accident(
// 			Origin::signed(vehicle),
// 			// vehicle,
// 			data_hash
// 		));

// 		// is accident stored
// 		assert!(AccidentCount::<Test>::contains_key(vehicle));
// 		//get the number of reported accidents, should be == 1
// 		let count: u32 = match AccidentCount::<Test>::get(vehicle) {
// 			// Return an error if the value has not been set.
// 			None => 0,
// 			Some(val) => val,
// 		};
// 		assert!(count == 1);

// 		//now check the stored report: data is a composit key == hash(vehicle id + (count-1))
// 		let mut hasher = Sha256::new();
// 		sha2::Digest::update(&mut hasher, vehicle.to_ne_bytes());
// 		sha2::Digest::update(&mut hasher, (count - 1).to_ne_bytes()); //-1 because we start at 0
// 		let accident_key: [u8; 32] = hasher.finalize().into();
// 		//check if contains an accident report
// 		assert!(Accidents::<Test>::contains_key(accident_key));
// 	});
// }
