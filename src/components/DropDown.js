import React, {useState} from "react"
import "../styling/DropDown.css"


const DropDown = ({options, title, callback}) => {

    const [selectedOption, setSelectedOption] = useState(null);
    const [show, setShow] = useState(false);

    const onSelect = (data) =>{
        callback(data)
    }
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        onSelect(option);
        setShow(false);
    };


    return(
        <div className="dd">
            <div className="dd-header" onClick={() => setShow(!show)}>
                {title}
                <span className={`dd-arrow ${show ? 'up' : 'down'}`}></span>
            </div>
            <div className="o_menu">
                {show && (
                    <ul className="o">
                        {options.map((option) => (
                            <li className="so"
                                key={option}
                                onClick={() => handleOptionSelect(option)}>
                                {option}
                            </li>
                        ))}
                    </ul>
                )}
            </div>


        </div>
    )
}

export default DropDown;