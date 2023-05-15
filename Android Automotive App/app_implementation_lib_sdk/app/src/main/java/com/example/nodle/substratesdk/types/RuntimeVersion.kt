package com.example.nodle.substratesdk.types


data class RuntimeVersion(
    var specName: String,
    var implName: String,
    var authoringVersion: UInt,
    var specVersion: UInt,
    var implVersion: UInt,
    var apis: List<String> = ArrayList(),

    var transactionVersion: UInt,
    var stateVersion: UInt,

)