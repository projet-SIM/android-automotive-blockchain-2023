package com.example.app_implementation_lib_sdk

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import io.nodle.substratesdk.getValueTest
import io.nodle.substratesdk.rpc.SubstrateProvider
import org.hamcrest.CoreMatchers
import org.junit.Assert
import java.util.concurrent.LinkedBlockingQueue

class GetData2 : AppCompatActivity() {
    lateinit var mNextButton: Button
    lateinit var mDataEditText: EditText
    lateinit var mGetData2Button: Button
    lateinit var mTextViewData2: TextView
    override fun onCreate(savedInstanceState: Bundle?) {
        setContentView(R.layout.activity_get_data2)
        mNextButton = findViewById(R.id.NextButton2)
        mDataEditText = findViewById(R.id.editData)
        mGetData2Button = findViewById(R.id.buttonGetData2)
        mTextViewData2 = findViewById(R.id.textViewScroll2)
        super.onCreate(savedInstanceState)
        mNextButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {

                val gameActivityIntent = Intent(this@GetData2, PostExtrinsic::class.java);
                startActivity(gameActivityIntent)
            }
        })
        mGetData2Button.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {
                val rpcUrl = "ws://10.0.2.2:8844"
                var test = ""
                println(rpcUrl)
                val queue = LinkedBlockingQueue<Int>()
                var n =mDataEditText.text.toString()
                Thread {

                    val provider = SubstrateProvider(rpcUrl)
                    val testoo = getValueTest(provider,n).blockingGet()

                    test = testoo.removePrefix("0x")
                    println(testoo)

                    Assert.assertThat(
                        testoo,
                        CoreMatchers.notNullValue())
                    println("concurrency ftw")
                    Thread.sleep(1_000)
                    println("finish sleeping!")
                    queue.add(1)
                }.start()

                println("first")
                println(queue.take())
                println(test)
                mTextViewData2.text = test
                // socketService.stop() // all subscriptions/pending requests are cancelled
                println("ça maaaaarche et ça fini")
            }
        })

    }
}