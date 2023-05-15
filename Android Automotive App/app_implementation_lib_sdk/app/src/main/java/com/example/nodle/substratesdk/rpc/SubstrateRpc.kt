package io.nodle.substratesdk.rpc

import io.nodle.substratesdk.utils.onDebugOnly
import io.reactivex.rxjava3.core.Single

/**
 * @author Lucien Loiseau on 12/05/21.
 */
class SubstrateRpc(substrateUrls: Array<out String>) {

    //private val log: Logger = LoggerFactory.getLogger(SubstrateRpc::class.java)

    private val rpcEndpoints = substrateUrls.mapNotNull { url ->
        when {
            url.startsWith("ws") -> WebSocketRpc(url)
           // url.startsWith("http") -> HttpRpc(url)
            else -> null
        }
    }

    /**
     * TODO: would be nice to not do any blockingget in there,
     * feels a bit like cheating, not really rxjava-ly
     */
    fun <T> send(method: RpcMethod, defaultValue: T? = null): Single<T> {
        return Single.just(rpcEndpoints).map {
                it.forEach { rpc ->
                    try {
                        println("gnochi ")
                        return@map rpc.send<T>(method, defaultValue).blockingGet()


                    }
                    catch (e: Exception) {
                        onDebugOnly { println("rpc error (${rpc.url()}) !! ${e.message}") }
                        // ignore
                    }
                }
                onDebugOnly { println("rpc error !! no endpoint left to try") }
                throw Exception()
            }
    }

}