package io.nodle.substratesdk

import com.google.gson.Gson
import io.nodle.substratesdk.account.Account
import io.nodle.substratesdk.account.Wallet
import io.nodle.substratesdk.account.signMsg
import io.nodle.substratesdk.rpc.*
import io.nodle.substratesdk.scale.readAccountInfoSub3
import io.nodle.substratesdk.scale.toU8a
import io.nodle.substratesdk.scale.v1.readAccountInfoV1
import io.nodle.substratesdk.types.*
import io.nodle.substratesdk.utils.blake128
import io.nodle.substratesdk.utils.hexToBa
import io.nodle.substratesdk.utils.toHex
import io.nodle.substratesdk.utils.xxHash128
import io.reactivex.rxjava3.core.Single
import io.reactivex.rxjava3.functions.Function5
import org.json.JSONArray
import org.json.JSONObject
import java.math.BigInteger
import java.nio.ByteBuffer

/**
 * @author Lucien Loiseau on 14/07/20.
 */
@ExperimentalUnsignedTypes
fun Account.getAccountInfo(provider: SubstrateProvider): Single<AccountInfo> {
    return provider.getMetadata()
        .flatMap { metadata ->
            val ba = toU8a()
            val key = "System".xxHash128() + "Account".xxHash128() + ba.blake128() + ba
            provider.rpc.send<String>(StateGetStorage("0x" + key.toHex()), "")
                .map { scale ->
                    if (scale == "") {
                        nullAccountInfo
                    }
                    else {
                        when (metadata.runtimeVersion.toInt()) {

                            in 0..11 -> ByteBuffer.wrap(scale.hexToBa()).readAccountInfoV1()
                            else -> ByteBuffer.wrap(scale.hexToBa()).readAccountInfoSub3()
                        }
                    }
                }
        }
}

@ExperimentalUnsignedTypes
fun getValueTest(provider: SubstrateProvider , value: String): Single<String> {
    return provider.getMetadata().flatMap { metadata ->
        val ba = value.hexToBa()
        val key = "KeyvalueModule".xxHash128() + "KeyValue".xxHash128() + ba.blake128() + ba
        provider.rpc.send<String>(StateGetStorage("0x" + key.toHex()), "")
            .map { scale ->
                if (scale == "") {
                    "pas de retour"
                } else {
                    scale.toString()
                }
            }

    }
}

    @ExperimentalUnsignedTypes
    fun Account.getBalance(provider: SubstrateProvider): Single<BigInteger> {
        return getAccountInfo(provider)
            .map { it.data.free }
    }


    fun Extrinsic.estimateFee(provider: SubstrateProvider): Single<BigInteger> {
        return provider.rpc
            .send<JSONObject>(PaymentQueryInfo("0x" + toU8a(provider).toHex()))
            .map { it.getString("partialFee").toBigInteger() }
    }

    fun PostExtrinsicP(provider: SubstrateProvider, value: String): Single<String> {
        return provider.getMetadata().flatMap {metadata ->
            val ba = value.hexToBa()
            provider.rpc.send<String>(AuthorSubmitExtrinsic("0x" + ba.toHex()),"")
                .map { scale ->
                    if (scale == "") {
                        "pas de retour"
                    } else {
                        scale.toString()
                    }
                }
        }

    }

fun SendCall(provider: SubstrateProvider, value: String): Single<String> {
    return provider.getMetadata().flatMap {metadata ->
        val ba = value

        try {
            provider.rpc.send<String>(AccountNextIndex(ba))
                .map { response ->
                    if (response.isEmpty()) {
                        return@map "No response"
                    } else {
                        return@map response
                    }
                }
        }
        catch (e: Exception) {
            return@flatMap Single.error(e)
        }
    }

}



