choose_test_prefix = "test_4" 
collator_format_1 = "0collator" 

######################################## output tps ##################################################
reset

set terminal postscript eps enhanced color font 'Times-Roman,20' size 6,8
set output 'stats_cloud_'.choose_test_prefix.'_'.collator_format_1.'_output_tps.eps'

set multiplot layout 3,1 

set title "Input TPS vs Avg Output TPS"

set style data histogram
set style histogram cluster gap 1
set style fill solid 0.5
set boxwidth 0.9
set xtics format "" nomirror rotate by 45 right offset 0.5,0
set grid ytics
set style histogram errorbars linewidth 1 
set errorbars linecolor black
set bars front

set yrange [0:1000]
set grid y

set ylabel "Avg Output TPS"
set xlabel "Input TPS"
# set y2tics (0, 5, 10, 15, 20, 25, 30, 40, 45, 50)
# set y2label "Error %"

set datafile separator comma
set key reverse left top Left
set key autotitle columnhead

plot './block_logs/compiled/'.choose_test_prefix.'__'.collator_format_1.'_stats_values.csv' using 3:7:xtic(1) title "Substrate-based - Aura consensus" lc rgbcolor "blue" lt 1, \
    '' using 0:0:xtic(1):12 with labels font ",15" offset -1,0 tc rgb "red" rotate left notitle

# plot './block_logs/compiled/'.choose_test_prefix.'__'.collator_format_1.'_stats_values.csv' using 3:7:xtic(1) title "Substrate-based - Aura consensus" lc rgbcolor "blue" lt 1 axis x1y1, \
#     '' using 12:xtic(1) with lines title "Error OEM" lc rgbcolor "blue" lt 2 axis x1y2, \
#     './block_logs/compiled/'.choose_test_prefix.'insurance_'.collator_format_1.'_stats_values.csv' using 3:7:xtic(1) title "Insurance" lc rgbcolor "pink" lt 1 axis x1y1, \
#     '' using 12:xtic(1) with lines title "Error Insurance" lc rgbcolor "pink" lt 2 axis x1y2

# unset multiplot 


######################################## blocktime ##################################################
# reset

# set terminal postscript eps enhanced color font 'Times-Roman,18' size 6,4
# set output "stats_cloud_blocktime.eps"

# set multiplot layout 1,1


set title "Input TPS vs Avg Blocktime"

set style data histogram
set style histogram cluster gap 1
set style fill solid 0.5
set boxwidth 0.9
set xtics format "" nomirror rotate by 45 right offset 0.5,0
set grid ytics
set style histogram errorbars linewidth 1 
set errorbars linecolor black
set bars front

set yrange [0:10]
set grid y

set ylabel "Avg Blocktime (s)"
set xlabel "Input TPS"

set datafile separator comma
set key reverse left top Left
set key autotitle columnhead

plot './block_logs/compiled/'.choose_test_prefix.'__'.collator_format_1.'_stats_values.csv' using 5:9:xtic(1) title "Substrate-based - Aura consensus" lc rgbcolor "blue" lt 1

# unset multiplot 


# ######################################## test time ##################################################
# reset

# set terminal postscript eps enhanced color font 'Times-Roman,18' size 6,4
# set output "stats_cloud_test_time.eps"

# set multiplot layout 1,1


set title "Input TPS vs Test Time"

set style data histogram
set style histogram cluster gap 1
set style fill solid 0.5
set boxwidth 0.9
set xtics format "" nomirror rotate by 45 right offset 0.5,0
set grid ytics
# set style histogram errorbars linewidth 1 
# set errorbars linecolor black
set bars front

# set yrange [0:800]
set grid y
set autoscale y

set ylabel "Test Time (s)"
set xlabel "Input TPS"

set datafile separator comma
set key reverse right top Left
set key autotitle columnhead

plot './block_logs/compiled/'.choose_test_prefix.'__'.collator_format_1.'_stats_values.csv' using 13:xtic(1) title "Substrate-based - Aura consensus" lc rgbcolor "blue" lt 1, \
    '' using 14:xtic(1) with lines title "Expected Test Time" lc rgbcolor "black" lt 2


unset multiplot 