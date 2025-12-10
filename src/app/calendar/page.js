import CalendarMonth from "../components/CalendarMonth";
import DateCell from "../components/DateCell"

export default function Calendar() {

    const today = new Date();
    const month = today.getMonth() + 1;


    return (
        
        <div className="flex flex-col items-center justify-center p-8">
            <h1 className="text-center font-extrabold">Akcela Booking Calendar</h1>
            
            <p>Select a date to book your 2 hour slot</p>

            <div className="min-h-screen w-full">

            <CalendarMonth month={month} current_date={today} />

            </div>

        </div>

    )
}