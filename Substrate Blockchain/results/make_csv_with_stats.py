import glob
import csv
import re
import statistics as stats

default_extrinc_count = 1 # timestamp set is always present in block

def extract_int_tps(string):
    parsed_string = re.findall(r'\d+tps', string)
    if len(parsed_string) == 0:
        return None
    parsed_int = int(re.findall(r'\d+', parsed_string[0])[0])
    return parsed_int

def extract_int_totaltx(string):
    parsed_string = re.findall(r'\d+totaltx', string)
    if len(parsed_string) == 0:
        return None
    parsed_int = int(re.findall(r'\d+', parsed_string[0])[0])
    return parsed_int

def generate_csv(prefix_path, parachain, nb_collators):
    # Get a list of all CSV files that start with "big_tests_" in the prefix path folder
    csv_files = glob.glob(
        f"./block_logs/{parachain}/{prefix_path}_*{nb_collators}_*.csv")
    # Create an empty list to store the results
    results = []

    # Iterate over the CSV files
    for file in csv_files:
        print(file)
        # Open the current file
        with open(file, 'r') as f:
            # Create a CSV reader object
            reader = csv.DictReader(f, delimiter=',')
            # Initialize a variable to store the maximum "tps" value
            total_tx = 30000 if (extract_int_tps(file)*60*2) > 30000 else (extract_int_tps(file)*60*2)
            total_tx = extract_int_totaltx(file) if extract_int_totaltx(file) is not None else total_tx
            percentage_failed_tx = 0
            success_tx = 0
            failed_tx = 0
            max_tps = 0
            avg_tps = 0.0
            nb_blocks_used = 0
            max_blocktime = 0
            avg_blocktime = 0.0
            expected_delay = 0
            test_delay = -1
            lastest_test_blocktime = 0
            tps_list = []
            blocktime_list = []
            # Iterate over the rows of the current file
            for row in reader:
                # Update the maximum "tps" value if the current value is greater
                if float(row['tps']) > max_tps:
                    max_tps = round(float(row['tps']), 2)
                # Update the maximum "blocktime" value if the current value is greater
                if float(row['blocktime']) > max_blocktime:
                    max_blocktime = round(float(row['blocktime']), 2)
                # Update variables only if the number of transactions is greater than default_extrinc_count
                # (default_extrinc_count transactions are always sent because of the runtime setup)
                if int(row['transactions']) > default_extrinc_count:
                    success_tx += (int(row['transactions']) - default_extrinc_count)
                    avg_tps += float(row['tps'])
                    nb_blocks_used += 1
                    avg_blocktime += float(row['blocktime'])
                    tps_list.append(float(row['tps']))
                    blocktime_list.append(float(row['blocktime']))
                
                if int(row['transactions']) > default_extrinc_count:
                    # update end time of the test: the last block that has more than default_extrinc_count transactions
                    lastest_test_blocktime = int(row['timestamp'])
                # Update the test delay if the number of transactions is greater than default_extrinc_count and the test delay is not set
                if test_delay == -1 and int(row['transactions']) > default_extrinc_count:
                    # start time of the test
                    test_delay = int(row['timestamp'])
            
            # The test delay is the difference between the start time and the end time of the test
            test_delay = round((lastest_test_blocktime - test_delay)/1000, 1)
            # print("Test delay: {}s".format(test_delay))
            percentage_failed_tx = "{}%".format(round(
                (1 - (success_tx/total_tx))*100, 2)) if round((1 - (success_tx/total_tx))*100, 2) > 0.01 else ""
            failed_tx = total_tx - success_tx
            if (failed_tx < 0):
                print("{}: {}".format(file.split("/")[-1], failed_tx))
            avg_tps = round(avg_tps/nb_blocks_used, 2)
            avg_blocktime = round(avg_blocktime/nb_blocks_used, 2)
            tps_var = round(stats.pvariance(tps_list), 2)
            tps_std = round(stats.pstdev(tps_list), 2)
            blocktime_var = round(stats.pvariance(blocktime_list), 2)
            blocktime_std = round(stats.pstdev(blocktime_list), 2)
            expected_delay = round((total_tx/extract_int_tps(file)), 2)
            # Append the current file's name TPS and maximum "tps" value to the results list
            results.append([extract_int_tps(file), max_tps, avg_tps, max_blocktime,
                           avg_blocktime, tps_var, tps_std, blocktime_var, blocktime_std, success_tx, 
                           failed_tx, percentage_failed_tx, test_delay, expected_delay])

    # Write the results to a new CSV file
    with open(f'./block_logs/compiled/{prefix_path}_{parachain}_{nb_collators}_stats_values.csv', 'w', newline='') as f:
        results.sort(key=lambda x: x[0])
        writer = csv.writer(f)
        writer.writerow(['Input TPS', 'Max Output TPS', 'Avg Output TPS', 'Max Block Time', 'Avg Block Time',
                        'TPS Variance', 'TPS Standard Deviation', 'Block Time Variance', 'Block Time Standard Deviation',
                         'Success TX', 'Failed TX', 'Percentage Failed TX', 'Test Delay (s)', 'Expected Delay (s)'])
        writer.writerows(results)


generate_csv("test_1", "", "1collator")
generate_csv("test_2", "", "0collator")
generate_csv("test_3", "", "0collator")
generate_csv("test_4", "", "0collator")