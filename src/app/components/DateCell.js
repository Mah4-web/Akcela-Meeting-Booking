export default function DateCell({ shortDate, fullDate, isToday }) {
    return (
        <div>
            {isToday ? 
            <button className="rounded-lg shadow-2xl bg-black text-white w-full hover:bg-blue-600 hover:text-white hover:duration-500 hover:cursor-pointer text-center">{shortDate}</button> 
            : 
            <button className="border shadow-2xl  rounded-lg w-full hover:bg-blue-600 hover:text-white hover:duration-500 hover:cursor-pointer text-center">{shortDate}</button>}
        </div>
    );
}