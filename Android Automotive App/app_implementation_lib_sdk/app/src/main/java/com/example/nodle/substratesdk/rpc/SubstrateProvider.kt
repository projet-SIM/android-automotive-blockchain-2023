package io.nodle.substratesdk.rpc


import io.reactivex.rxjava3.core.Single
import jp.co.soramitsu.fearless_utils.runtime.definitions.dynamic.DynamicTypeResolver
import jp.co.soramitsu.fearless_utils.runtime.definitions.registry.TypeRegistry

import jp.co.soramitsu.fearless_utils.runtime.definitions.registry.v14Preset
import jp.co.soramitsu.fearless_utils.runtime.definitions.v14.TypesParserV14
import jp.co.soramitsu.fearless_utils.runtime.metadata.RuntimeMetadataReader
import jp.co.soramitsu.fearless_utils.runtime.metadata.RuntimeMetadata
import org.json.JSONObject
import jp.co.soramitsu.fearless_utils.runtime.metadata.builder.VersionedRuntimeBuilder

import jp.co.soramitsu.fearless_utils.runtime.metadata.v14.RuntimeMetadataSchemaV14


/**
 * @author Lucien Loiseau on 29/07/20.
 */
class SubstrateProvider(vararg substrateRpcUrl: String) {


    //val rpc = SocketService(gson,logger, webSocketFactory, reconnector, requestExecutor )

    val rpc = SubstrateRpc(substrateRpcUrl)

    var genesisHash: String? = null
    var metadata: RuntimeMetadata? = null
    var rawmetadata: String? = null
    var runtimeVersion: JSONObject? = null

    fun getGenesisHash(): Single<String> {
        if (genesisHash != null)
            return Single.just(genesisHash)

        return rpc.send<String>(ChainGetBlockHash(0))
            .map { it}
            .doOnSuccess { genesisHash = it }
    }

    fun getHash( n :Int): Single<String> {
        if (genesisHash != null)
            return Single.just(genesisHash)

        return rpc.send<String>(ChainGetBlockHash(n))
            .map { it}
            .doOnSuccess { genesisHash = it }
    }

    @ExperimentalUnsignedTypes
    fun getMetadata(): Single<RuntimeMetadata> {
        if (metadata != null)
            return Single.just(metadata)

        return rpc.send<String>(StateGetMetadata())
            .map { it }
            .map { metadatatypes14(it.toString()) }
            .doOnSuccess{metadata = it}
    }

    fun getRawMetadata(): Single<String> {
        return rpc.send<String>(StateGetMetadata())
            .map { it.toString() }
            .doOnSuccess{rawmetadata = it}
    }

    fun metadatatypes14(inHex :String): RuntimeMetadata {
        //val inHex = getFileContentFromResources("westend_metadata_v14")
        val metadataReader = RuntimeMetadataReader.read(inHex)
        val typePreset = TypesParserV14.parse(
            lookup = metadataReader.metadata[RuntimeMetadataSchemaV14.lookup],
            typePreset = v14Preset()
        )

        val typeRegistry = TypeRegistry(
            typePreset,
            DynamicTypeResolver.defaultCompoundResolver()
        )
        return VersionedRuntimeBuilder.buildMetadata(metadataReader, typeRegistry)
    }

/*
    @ExperimentalUnsignedTypes
    fun transferCall(destAccount: Account, amount: BigInteger): Single<TransferCall> {
        return this.getMetadata().map {
            val call = it.findCall("Balances", "transfer")
                ?: throw CallNotFoundException("Balance transfer call is not supported on this blockchain")
            TransferCall(
                call.moduleIndex,
                call.callIndex,
                destAccount,
                amount
            )
        }
    }*/

    fun getRuntimeVersion(): Single<JSONObject> {
        if (runtimeVersion != null)
            return Single.just(runtimeVersion)

        return rpc.send<JSONObject>(StateGetRuntimeVersion())
            .doOnSuccess { runtimeVersion = it }
    }

    fun getSpecVersion(): Single<Long> {
        return this.getRuntimeVersion().map {
            it.getLong("specVersion")
        }
    }

    fun getTransactionVersion(): Single<Long> {
        return this.getRuntimeVersion().map {
            it.getLong("transactionVersion")
        }
    }
}