use super::*;
use crate::{mock::*, Error, Event as TestEvent};
use frame_support::{assert_noop, assert_ok};
use sp_runtime::DispatchError;

#[test]
fn it_works_for_default_value() {
	new_test_ext().execute_with(|| {
		// create a new factory
		assert_ok!(SimRenaultPallet::create_factory(Origin::root(), 1));
		// is factory stored
		assert!(Factories::<Test>::contains_key(1));
		// is a second factory not stored
		assert!(!Factories::<Test>::contains_key(2));

		// create a new vehicle using factory as signer
		assert_ok!(SimRenaultPallet::create_vehicle(Origin::signed(1), 2));
		// is vehicle stored
		assert!(Vehicles::<Test>::contains_key(2));
		// is a second vehicle not stored
		assert!(!Vehicles::<Test>::contains_key(1));
	});
}

#[test]
fn emits_factory_stored_events_correctly() {
	new_test_ext().execute_with(|| {
		// Set block number to 1 because events are not emitted on block 0.
		System::set_block_number(1);

		// Should emit event FactoryStored
		assert_ok!(SimRenaultPallet::create_factory(Origin::root(), 1));
		System::assert_has_event(mock::Event::SimRenaultPallet(TestEvent::FactoryStored(1)));
	})
}

#[test]
fn emits_vehicle_stored_events_correctly() {
	new_test_ext().execute_with(|| {
		// Set block number to 1 because events are not emitted on block 0.
		System::set_block_number(1);

		assert_ok!(SimRenaultPallet::create_factory(Origin::root(), 1));
		// Should emit event FactoryStored
		assert_ok!(SimRenaultPallet::create_vehicle(Origin::signed(1), 2));
		System::assert_has_event(mock::Event::SimRenaultPallet(TestEvent::VehicleStored(2, 1)));
	})
}

#[test]
fn emits_vehicle_initialized_events_correctly() {
	new_test_ext().execute_with(|| {
		// Set block number to 1 because events are not emitted on block 0.
		System::set_block_number(1);

		assert_ok!(SimRenaultPallet::create_factory(Origin::root(), 1));
		assert_ok!(SimRenaultPallet::create_vehicle(Origin::signed(1), 2));
		// Should emit event FactoryStored
		assert_ok!(SimRenaultPallet::init_vehicle(Origin::signed(2), 2));
		System::assert_has_event(mock::Event::SimRenaultPallet(TestEvent::VehicleInitialized(2)));
	})
}

#[test]
fn correct_error_for_none_value() {
	new_test_ext().execute_with(|| {
		// Ensure the expected error is thrown.
		//Is sudo user creating factory
		assert_noop!(
			SimRenaultPallet::create_factory(Origin::signed(1), 1),
			DispatchError::BadOrigin
		);

		//Error if factory already exist
		assert_ok!(SimRenaultPallet::create_factory(Origin::root(), 1));
		assert_noop!(
			SimRenaultPallet::create_factory(Origin::root(), 1),
			Error::<Test>::FactoryAlreadyStored
		);

		//Error if vehicle already exist
		assert_ok!(SimRenaultPallet::create_vehicle(Origin::signed(1), 2));
		assert_noop!(
			SimRenaultPallet::create_vehicle(Origin::signed(1), 2),
			Error::<Test>::VehicleAlreadyStored
		);

		//Error if factory not exist
		assert_noop!(
			SimRenaultPallet::create_vehicle(Origin::signed(2), 1),
			Error::<Test>::UnknownFactory
		);

	});
}
