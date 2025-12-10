export default function DateCell({ shortDate, fullDate, isToday }) {
    return (
        <div>
            {isToday ? 
            <button className="p-1 sm:p-2 border rounded-lg bg-black text-white w-full hover:bg-blue-600 hover:text-white hover:duration-500 hover:cursor-pointer">{shortDate}</button> 
            : 
            <button className="p-1 sm:p-2 border rounded-lg w-full hover:bg-blue-600 hover:text-white hover:duration-500 hover:cursor-pointer">{shortDate}</button>}
        </div>
    );
}