package com.example.app_implementation_lib_sdk

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import com.google.gson.Gson
import io.nodle.substratesdk.rpc.SubstrateProvider
import org.hamcrest.CoreMatchers
import org.junit.Assert
import java.util.concurrent.LinkedBlockingQueue

class GetData : AppCompatActivity() {

    lateinit var mNextButton: Button
    lateinit var mMetadataButton: Button
    lateinit var mScrollTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        setContentView(R.layout.activity_get_data)
        mNextButton = findViewById(R.id.NextButton)
        mMetadataButton = findViewById(R.id.MetadataButton)
        mScrollTextView = findViewById(R.id.textViewScroll)
        super.onCreate(savedInstanceState)
        mNextButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {

                val gameActivityIntent = Intent(this@GetData, GetData2::class.java);
                startActivity(gameActivityIntent)
            }
        })
        mMetadataButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {

                //    findNavController().navigate(R.id.action_FirstFragment_to_SecondFragment)


                //réseau cloud
                // val rpcUrl = "wss://cloud-substrate.gerrits.xyz"
                val rpcUrl = "ws://10.0.2.2:8844"
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
                    val rawMeta = provider.getRawMetadata().blockingGet()
                    val gson = Gson()
                    val jsonTest: String = gson.toJson(meta)
                    test = jsonTest
                    println("concurrency ftw")
                    Thread.sleep(1_000)
                    println("finish sleeping!")

                    queue.add(1)
                }.start()

                println("first")
                println(queue.take())
                println(test)
                mScrollTextView.text = test
                // socketService.stop() // all subscriptions/pending requests are cancelled
                println("ça maaaaarche et ça fini")

            }
        })
    }
}