//! Benchmarking setup for pallet-sim-renault

#![cfg(feature = "runtime-benchmarks")]


use super::*;

#[allow(unused)]
use crate::Pallet as SimRenault;
use frame_benchmarking::{benchmarks, impl_benchmark_test_suite, account, whitelisted_caller};
use frame_system::RawOrigin;

const SEED: u32 = 0;

benchmarks! {
	create_factory {
		let factory: T::AccountId = whitelisted_caller();
	}: _(RawOrigin::Root, factory.clone())
	verify {
		assert!(Factories::<T>::contains_key(factory.clone()));
	}
	create_vehicle {
		let vehicle: T::AccountId = whitelisted_caller();
		let factory: T::AccountId = account("new", 0, SEED);
		let block_number = &frame_system::Pallet::<T>::block_number();

		//init state with an exisiting factory
		Factories::<T>::insert(factory.clone(), block_number);

	}: _(RawOrigin::Signed(factory.clone()), vehicle.clone())
	verify {
		assert!(Factories::<T>::contains_key(factory.clone()));
		assert!(Vehicles::<T>::contains_key(vehicle.clone()));
	}
	init_vehicle {
		let vehicle: T::AccountId = whitelisted_caller();
		let factory: T::AccountId = account("new", 0, SEED);
		let block_number = &frame_system::Pallet::<T>::block_number();

		//init state with an exisiting factory and vehicle
		Factories::<T>::insert(factory.clone(), block_number);
		Vehicles::<T>::insert(vehicle.clone(), (factory.clone(), block_number));

	}: _(RawOrigin::Signed(vehicle.clone()), vehicle.clone())
	verify {
		assert!(VehiclesStatus::<T>::contains_key(vehicle.clone()));
	}
}

impl_benchmark_test_suite!(SimRenault, crate::mock::new_test_ext(), crate::mock::Test,);
