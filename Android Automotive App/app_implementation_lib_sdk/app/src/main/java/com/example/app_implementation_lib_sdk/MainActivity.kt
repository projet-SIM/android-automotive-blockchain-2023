package com.example.app_implementation_lib_sdk

//import io.github.novacrypto.toruntime.CheckedExceptionToRuntime
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.test.core.app.ActivityScenario.launch
import io.nodle.substratesdk.rpc.SubstrateProvider
import io.nodle.substratesdk.utils.*
import org.hamcrest.CoreMatchers
import org.junit.Assert
import java.util.concurrent.LinkedBlockingQueue
import com.example.app_implementation_lib_sdk.SignerTest
import kotlinx.coroutines.launch


class MainActivity : AppCompatActivity() {


    lateinit var mGenesisHashTextView: TextView
    lateinit var mGenesisHashButton: Button
    lateinit var mGetBlockHashButton: Button
    lateinit var mBlockHashTextView: TextView
    lateinit var mNBlockEditText: EditText
    lateinit var mResetButton: Button



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        println("on commence")
   //     socketService.start("wss://cloud-substrate.gerrits.xyz") // async connect
        println("ça maaaaarche")

        setContentView(R.layout.activity_main)
        mGenesisHashTextView = findViewById(R.id.GenesisHashTextView)
        mGenesisHashButton = findViewById(R.id.GenesisHashButton)
        mResetButton = findViewById(R.id.ResetButton)
        mGetBlockHashButton = findViewById(R.id.HashButton)
        mNBlockEditText = findViewById(R.id.editNBlock)
        mBlockHashTextView = findViewById(R.id.HashBlockTextView)

        mGenesisHashButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {
            //    findNavController().navigate(R.id.action_FirstFragment_to_SecondFragment)


            //réseau cloud
                val rpcUrl = "wss://substrate-local.gerrits.xyz"
                //val rpcUrl = "ws://10.0.2.2:8844"
                var test = "toto"
                println(rpcUrl)

                val queue = LinkedBlockingQueue<Int>()

                Thread {
                    val provider = SubstrateProvider(rpcUrl)
                    val meta = provider.getMetadata().blockingGet()
                    Assert.assertThat(
                        meta,
                        CoreMatchers.notNullValue()
                    )
                    /*
                    println("chaaaaaaaaaaaaaaaaat")
                    //toto = "trial interest ten tube belt blur radio cousin plastic fault limit maid"
                    //wrong primary volcano wild wide clean never youth hurry plunge hospital diesel

                    val publicKeyHex = "f8930aea4760b9972f422d263b87a40cc7e2a37c786812c63dd53aaa06969f20"
                    val privateKeyHex = "e2283ecd5482f1c62f4e0fbd479e9e619c32f0ae703e7e189c3fa9378fa4002d"

                    val keypair = BaseKeypair(privateKeyHex.fromHex(), publicKeyHex.fromHex())

                    val message = "04" +
                            "00" +
                            "0900" +
                            "0400" +
                            "0401"
                    val messageBytes = message.fromHex()

                    val signatureWrapper = jp.co.soramitsu.fearless_utils.encrypt.Signer.sign(
                        MultiChainEncryption.Substrate(EncryptionType.ECDSA), messageBytes, keypair) as SignatureWrapper.Ecdsa

                    val tt = signatureWrapper.signature.toHexString()
                    //val ttt = toU8a(provider).toHex()
                    val expected =
                        "352e2738b0e361a7c59be05d52e7e7fb860bf79c03bb7858ce3e48748b00040c4dc6eadbfd526d35ba6dff1468bf61198cc5e8570a80ddc63fdebe68dc6016a41b"

                    Assert.assertEquals(expected, signatureWrapper.signature.toHexString())
                    val wallet1 = Wallet("wrong primary volcano wild wide clean never youth hurry plunge hospital diesel")
                    println(wallet1.toString())
                    wallet1.ss58 = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                 //   val actualPublic = Hex.toHexString("5HgT99MgTEUpg6YLQ8h1PyJHnAtX7axT5o5J9fYNFiPZVQXN")
                    val publicKeyBytes = SS58Encoder.decode("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
                    val accounttest = AccountInfoRequest(publicKeyBytes)

                    val balance1 = wallet1.getAccountInfo(provider).blockingGet()
                    val t =  "0400"
                    val testoo = getValueTest(provider,t).blockingGet()
                    //val r = t.hexToBa()
                    //val s = ByteBuffer.wrap(r)
                    Assert.assertThat(balance1.data.free.toLong(), CoreMatchers.notNullValue())

*/





                    val hash = provider.getGenesisHash().blockingGet()
                    test = hash
                    println(hash)

                    Assert.assertThat(
                        hash,
                        CoreMatchers.notNullValue())
                    println("concurrency ftw")
                    Thread.sleep(1_000)
                    println("finish sleeping!")

                    queue.add(1)
                }.start()

                println("first")
                println(queue.take())
                println(test)
                mGenesisHashTextView.text = test
               // socketService.stop() // all subscriptions/pending requests are cancelled
                println("ça maaaaarche et ça fini")

            }
        })

        mGetBlockHashButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {


                val rpcUrl = "ws://10.0.2.2:8844"
                var test = ""
                println(rpcUrl)
                val queue = LinkedBlockingQueue<Int>()
                var n =mNBlockEditText.text.toString().toInt()
                Thread {

                    val provider = SubstrateProvider(rpcUrl)

                    val hash = provider.getHash(n).blockingGet()
                    test = hash
                    println(hash)

                    Assert.assertThat(
                        hash,
                        CoreMatchers.notNullValue())
                    println("concurrency ftw")
                    Thread.sleep(1_000)
                    println("finish sleeping!")
                    queue.add(1)
                }.start()

                println("first")
                println(queue.take())
                println(test)
                mBlockHashTextView.text = test
                // socketService.stop() // all subscriptions/pending requests are cancelled
                println("ça maaaaarche et ça fini")
            }
        })

        mResetButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {

                val gameActivityIntent = Intent(this@MainActivity, GetData::class.java);
                startActivity(gameActivityIntent)
            }
        })
    }
}