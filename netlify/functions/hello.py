import schedule
import time

def job():
    print("Hello, this job runs every minute.")

# Schedule the job every minute
schedule.every(1).minutes.do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
