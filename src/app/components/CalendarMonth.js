

export default function CalendarMonth({ month, year, today }) {
    return (
        <div className="mx-4 grid grid-cols-7 gap-4 [&>*]:text-center [&>*]:shadow-2xl">
            <div className="font-bold">Monday</div>
            <div className="font-bold">Tuesday</div>
            <div className="font-bold">Wednesday</div>
            <div className="font-bold">Thursday</div>
            <div className="font-bold">Friday</div>
            <div className="font-bold">Saturday</div>
            <div className="font-bold">Sunday</div>

            


        </div>
    );
}