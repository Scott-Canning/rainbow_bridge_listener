import { ethers } from 'ethers';
import ABI from "../utils/ABI.json";
import { useEffect, useState } from 'react';
import Aos from "aos";
import "aos/dist/aos.css";
import './listener.css'
import graphic from '../images/rb_bridge.png';

const Listener = () => {
    const[transactions, setTransactions] = useState([]);

    useEffect(() => {
        Aos.init({duration: 2000});
        let SHA256 = require("crypto-js/sha256");
        if(transactions.length > 10) {
            let newTransactions = transactions.shift()
            setTransactions(newTransactions);
        }
        const listener = async () => {
            const bridgeAddress = "0x6BFaD42cFC4EfC96f529D786D643Ff4A8B89FA52";
            const url = process.env.REACT_APP_MAINNET_URL;
            const provider = new ethers.providers.JsonRpcProvider(url);
            const contractInstance = new ethers.Contract(bridgeAddress, ABI, provider);    
    
            contractInstance.on("Deposited", (_sender, _recipient, _amount, _fee) =>  {
                let timestamp = Date.now();
                let date = convertTimestamp(timestamp);
                let tx_dict = {date: date, type: "Deposit", from: _sender, to: _recipient, amount: parseFloat(ethers.utils.formatEther(_amount)).toFixed(2)}
                console.log(tx_dict);
                if(transactions !== undefined && SHA256(tx_dict).toString() !== SHA256(transactions[transactions.length - 1]).toString()) {
                    setTransactions(oldArray => [...oldArray, tx_dict]);
                    console.log(transactions);
                } else if (transactions === undefined) {
                    setTransactions(oldArray => [...oldArray, tx_dict]);
                }  
            });

            contractInstance.on("Withdrawn", (_recipient, _amount) =>  {
                let timestamp = Date.now();
                let date = convertTimestamp(timestamp);
                let tx_dict = {date: date, type: "Withdrawal", to: _recipient, amount: parseFloat(ethers.utils.formatEther(_amount)).toFixed(2)}
                console.log(tx_dict);
                if(transactions !== undefined && SHA256(tx_dict).toString() !== SHA256(transactions[transactions.length - 1]).toString()) {
                    setTransactions(oldArray => [...oldArray, tx_dict]);
                    console.log(transactions);
                } else if (transactions === undefined) {
                    setTransactions(oldArray => [...oldArray, tx_dict]);
                }  
             });
        }
        listener();

    }, []);

    function convertTimestamp(UNIX_timestamp){
            var a = new Date(UNIX_timestamp);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
            return time;
    }


    return (
        <div className="container">
            <div className="txs-box">
                {transactions !== undefined ? transactions.map(tx =>
                <div className="container-txs" data-aos="fade-left">
                    <div className="Deposit">
                        <b>{tx.type}</b>
                    </div>
                    <div className="From">
                        { tx.type === "Deposit" ? <b>From: </b> : null }
                        { tx.from }
                    </div>
                    <div className="To">
                        <b>To: </b>  {tx.to}
                    </div>
                    <div className="Amount">
                        <b> Amount: </b> {tx.amount}  ETH
                    </div>
                </div>
                ) : (
                    null
                )}
            </div>
            <div className='img-container'>
                <img src={graphic} alt="display" className='img'/>
            </div>
        </div>
    );
}

export default Listener;