package com.example.app_implementation_lib_sdk


import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.util.concurrent.LinkedBlockingQueue



class PostExtrinsic : AppCompatActivity() {
    lateinit var mNextButton3: Button
   lateinit var mCreateFactoryButton: Button
    lateinit var mReportAccidentButton: Button
    lateinit var mCreateVehiculeButton: Button
    lateinit var mInitVehiculeButton: Button
    lateinit var mCreateFactoryTextView: TextView
    lateinit var mReportAccidentButtontextView: TextView
    lateinit var mCreateVehiculeTextView: TextView
    lateinit var mInitVehiculeTextView: TextView



    override fun onCreate(savedInstanceState: Bundle?) {

        setContentView(R.layout.activity_post_extrinsic)
        mNextButton3 = findViewById(R.id.nextButton3)
        mReportAccidentButton = findViewById(R.id.reportAccidentButton)
        mCreateVehiculeButton = findViewById(R.id.createVehiculeButton)
        mInitVehiculeButton = findViewById(R.id.initVehiculeButton)
        mCreateFactoryButton = findViewById(R.id.createFactoryButton)
        mCreateFactoryTextView = findViewById(R.id.createFactoryTextView)
        mReportAccidentButtontextView = findViewById(R.id.reportAccidentTextView)
        mCreateVehiculeTextView = findViewById(R.id.createVehiculeTextView)
        mInitVehiculeTextView = findViewById(R.id.initVehiculeTextView)
        super.onCreate(savedInstanceState)

        SubstrateCall().setContext(this@PostExtrinsic)
        mNextButton3.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {

                val gameActivityIntent = Intent(this@PostExtrinsic, MainActivity::class.java);
                startActivity(gameActivityIntent)
            }
        })

        mCreateFactoryButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {
                var factoryTextView = ""
                val queue = LinkedBlockingQueue<Int>()
                Thread {
                     val factoryTextView1 = SubstrateCall().SubstrateCallFunction(
                        "wss://substrate-local.gerrits.xyz",
                        "e5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a",
                        "de69225687283f127696fec71602e4ef84e9358e501c25253aaf14688f3f3c39",
                        0,
                        "00",
                        "00",
                         ""
                    )
                    factoryTextView = factoryTextView1
                    Thread.sleep(1_000)
                    println("finish sleeping!")
                    queue.add(1)
                }.start()
                println(queue.take())
                    println(factoryTextView)
                mCreateFactoryTextView.text = factoryTextView
                //mCreateVehiculeTextView.textColors = ColorStateList().
                // socketService.stop() // all subscriptions/pending requests are cancelled
                println("ça maaaaarche et ça fini")
            }
        })
        mCreateVehiculeButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {
                var factoryTextView = ""
                val queue = LinkedBlockingQueue<Int>()
                Thread {
                    val factoryTextView1 = SubstrateCall().SubstrateCallFunction(
                        "wss://substrate-local.gerrits.xyz",
                        "de69225687283f127696fec71602e4ef84e9358e501c25253aaf14688f3f3c39",
                        "3089cc7c3adfbdf303b2d3d316f7ba404b4c67a1abe48eb1019d58715c065a15",
                        1,
                        "00",
                        "00",
                        ""
                    )
                    factoryTextView = factoryTextView1
                    Thread.sleep(1_000)
                    println("finish sleeping!")
                    queue.add(1)
                }.start()

                println("first")
                println(queue.take())
                println(factoryTextView)
                mCreateVehiculeTextView.text = factoryTextView
                println("ça maaaaarche et ça fini")
            }
        })
        mInitVehiculeButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {
                var factoryTextView = ""
                val queue = LinkedBlockingQueue<Int>()
                Thread {
                    val factoryTextView1 = SubstrateCall().SubstrateCallFunction(
                        "wss://substrate-local.gerrits.xyz",
                        "3089cc7c3adfbdf303b2d3d316f7ba404b4c67a1abe48eb1019d58715c065a15",
                        "3089cc7c3adfbdf303b2d3d316f7ba404b4c67a1abe48eb1019d58715c065a15",
                        2,
                        "00",
                        "00",
                        ""
                    )
                    factoryTextView = factoryTextView1
                    Thread.sleep(1_000)
                    println("finish sleeping!")
                    queue.add(1)
                }.start()

                println("first")
                println(queue.take())
                println(factoryTextView)
                mInitVehiculeTextView.text = factoryTextView
                // socketService.stop() // all subscriptions/pending requests are cancelled
                println("ça maaaaarche et ça fini")
            }
        })
        mReportAccidentButton.setOnClickListener(object : View.OnClickListener{
            override fun onClick(view: View?) {
                val rpcUrl = "wss://substrate-local.gerrits.xyz"
                var factoryTextView = ""
                println(rpcUrl)
                val queue = LinkedBlockingQueue<Int>()
                Thread {
                    val dir = getFilesDir()//getContext(MainActivity).getFilesDir()
                    val cidHash = SubstrateCall().IpfsCallFunction("ipfs.gerrits.xyz",dir)

                    val factoryTextView1 = SubstrateCall().SubstrateCallFunction(
                        "wss://substrate-local.gerrits.xyz",
                        "3089cc7c3adfbdf303b2d3d316f7ba404b4c67a1abe48eb1019d58715c065a15",
                        "3089cc7c3adfbdf303b2d3d316f7ba404b4c67a1abe48eb1019d58715c065a15",
                        3,
                        "00",
                        "00",
                        cidHash
                    )
                    factoryTextView = factoryTextView1
                    Thread.sleep(1_000)
                    println("finish sleeping!")
                    queue.add(1)
                }.start()

                println("first")
                println(queue.take())
                println(factoryTextView)
                mReportAccidentButtontextView.text = factoryTextView
                // socketService.stop() // all subscriptions/pending requests are cancelled
                println("ça maaaaarche et ça fini")
            }
        })

    }
}