package com.example.app_implementation_lib_sdk

import android.app.Service
import android.content.Intent
import android.os.IBinder
//import androidx.car.app.hardware.AutomotiveCarHardwareManager
//import androidx.car.app.hardware.common.PropertyManager
//import androidx.car.app.hardware.CarHardwareManager
//import androidx.car.app.hardware.info.*


//import android.car.VehiclePropertyIds
//import android.car.hardware.CarPropertyValue
//import android.car.hardware.property.CarPropertyManager
import android.content.ContentValues
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
//import com.example.app_implementation_lib_sdk.constants.Constant

/*

class SpeedFragment : Service() {
    private lateinit var mCarPropertyManager:CarPropertyManager

    private var prevSpeed:Float = 0.0F

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_speed, container, false)

        mCarPropertyManager = (activity as MainActivity).getCarPropertyManager()
        prevSpeed = mCarPropertyManager.getFloatProperty(VehiclePropertyIds.PERF_VEHICLE_SPEED, 0)
        registerCarPropertyCallback()

        return view
    }

    override fun onResume() {
        super.onResume()

        registerCarPropertyCallback()
    }

    override fun onPause() {
        super.onPause()

        unregisterCarPropertyCallback()
    }

    private fun registerCarPropertyCallback() {
        mCarPropertyManager.registerCallback(
            speedCallback,
            VehiclePropertyIds.PERF_VEHICLE_SPEED,
            CarPropertyManager.SENSOR_RATE_FASTEST
        )
    }

    private fun unregisterCarPropertyCallback() {
        mCarPropertyManager.unregisterCallback(speedCallback)
    }

    private val speedCallback = object :  CarPropertyManager.CarPropertyEventCallback {
        override fun onChangeEvent(carPropertyValue: CarPropertyValue<*>) {
            val currentSpeed = ((carPropertyValue.value as Float) * Constant.KM_MULTIPLIER)

            if(prevSpeed != currentSpeed) {
                //speedometer.setSpeed(currentSpeed.toInt(), 0L)
                prevSpeed = currentSpeed
            }
        }

        override fun onErrorEvent(i: Int, i1: Int) {
            Log.e(ContentValues.TAG, "CarPropertyManager.onSpeedChangedError")
        }
    }

}*/