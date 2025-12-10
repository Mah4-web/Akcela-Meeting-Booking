import DateCell from "../components/DateCell"

export default function Calendar() {

    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const today = new Date().getDate();

    return (
        
        <div className="">
            <h1 className="text-center font-extrabold">Calendar Page</h1>
            
            <div className="mx-4 grid grid-cols-7 gap-4 [&>*]:text-center [&>*]:shadow-2xl">
                <div className="font-bold">Monday</div>
                <div className="font-bold">Tuesday</div>
                <div className="font-bold">Wednesday</div>
                <div className="font-bold">Thursday</div>
                <div className="font-bold">Friday</div>
                <div className="font-bold">Saturday</div>
                <div className="font-bold">Sunday</div>
                
                {/* Example dates */}

                <DateCell date="1" />
                <DateCell date="2" />
                <DateCell date="3" />
                <DateCell date="4" />
                <DateCell date="5" />
                <DateCell date="6" />
                <DateCell date="7" />
                <DateCell date="8" />
                <DateCell date="9" />
                <DateCell date="10" />
                <DateCell date="11" />
                <DateCell date="12" />
                <DateCell date="13" />
                <DateCell date="14" />
                <DateCell date="15" />
                <DateCell date="16" />
                <DateCell date="17" />
                <DateCell date="18" />
                <DateCell date="19" />
                <DateCell date="20" />
                <DateCell date="21" />
                <DateCell date="22" />
                <DateCell date="23" />
                <DateCell date="24" />
                <DateCell date="25" />
                <DateCell date="26" />
                <DateCell date="27" />
                <DateCell date="28" />
                <DateCell date="29" />
                <DateCell date="30" />
                <DateCell date="31" />


            </div>

        </div>

    )
}