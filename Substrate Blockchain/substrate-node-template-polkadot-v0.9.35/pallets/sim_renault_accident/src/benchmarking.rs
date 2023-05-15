//! Benchmarking setup for pallet-sim-renault

#![cfg(feature = "runtime-benchmarks")]


use super::*;

#[allow(unused)]
use crate::Pallet as SimRenaultAccident;
use frame_benchmarking::{benchmarks, impl_benchmark_test_suite, whitelisted_caller};
use frame_system::RawOrigin;

benchmarks! {
	report_accident {
		let vehicle: T::AccountId = whitelisted_caller();
		//Hash of "Hello world!"
	}: _(RawOrigin::Signed(vehicle.clone()), [0xc0, 0x53, 0x5e, 0x4b, 0xe2, 0xb7, 0x9f, 0xfd, 0x93, 0x29, 0x13, 0x05, 0x43, 0x6b, 0xf8, 0x89, 0x31, 0x4e, 0x4a, 0x3f, 0xae, 0xc0, 0x5e, 0xcf, 0xfc, 0xbb, 0x7d, 0xf3, 0x1a, 0xd9, 0xe5, 0x1a])
	verify {
		assert!(AccidentCount::<T>::contains_key(vehicle.clone()));
	}
}

impl_benchmark_test_suite!(SimRenaultAccident, crate::mock::new_test_ext(), crate::mock::Test,);
