import CalendarMonth from "../components/CalendarMonth";
import DateCell from "../components/DateCell"

export default function Calendar() {

    const today = new Date();
    const month = today.getMonth() + 1;


    return (
        
        <div className="flex flex-col sm:flex-row p-8">

            <div className="flex flex-col">
                <h1 className="text-center font-extrabold">Akcela Booking Calendar</h1>
                
                <p className="text-center">Select a date to book your 2 hour slot</p>

                <div className="min-h-screen w-full min-w-[320px]">

                    <CalendarMonth month={month} current_date={today} />

                </div>

            </div>

            <div className="grow bg-green-500 w-full min-h-screen grid grid-cols-7 grid-rows-7 gap-2 [&>*]:bg-green-400 [&>*]:flex [&>*]:items-center [&>*]:justify-center p-8">

                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>  

                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>

                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>

                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>

                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>

                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>

                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>

            </div>

        </div>

    )
}