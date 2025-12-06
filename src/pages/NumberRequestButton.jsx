// import { useEffect, useState } from "react";
// import { get, post } from "../lib/api";

// export default function NumberRequestButton({ receiverId }) {
//     const [status, setStatus] = useState(null);
//     const [receiverNumber, setReceiverNumber] = useState("");

//     // Fetch current request status
//     useEffect(() => {
//         get(`/found/request/status/${receiverId}`).then(res => {
//             if (res?.data) {
//                 setStatus(res.data.status);
//             }
//         });
//     }, [receiverId]);

//     // Send request
//     const sendRequest = async () => {
//         const res = await post("/found/request/send", { receiverId });
//         setStatus(res?.data.request.status);
//     };

//     // UI Conditions
//     if (status === "approved") {
//         return (
//             <p className="text-green-600 font-semibold">
//                 Number: {receiverNumber || "XXXXXXXXXX"}
//             </p>
//         );
//     }

//     if (status === "pending") {
//         return (
//             <p className="text-yellow-600 font-semibold">
//                 Request Sent
//             </p>
//         );
//     }

//     return (
//         <button
//             className="text-blue-600 font-medium hover:underline"
//             onClick={sendRequest}
//         >
//             Request Number
//         </button>
//     );
// }






















import { useEffect, useState } from "react";
import { get, post } from "../lib/api";

export default function NumberRequestButton({ receiverId }) {
  const [status, setStatus] = useState(null);
  const [receiverNumber, setReceiverNumber] = useState("");

  // Fetch status
  useEffect(() => {
    get(`/found/request/status/${receiverId}`)
      .then((res) => {
        const data = res;
        if (!data) {
          setStatus(null);
          setReceiverNumber("");
          return;
        }

        setStatus(data.status);

        if (data.status === "approved" && data.receiverPhone) {
          setReceiverNumber(data.receiverPhone);
        }
      })
      .catch(() => {});
  }, [receiverId]);

  // Send request
  const sendRequest = async () => {
    const res = await post("/found/request/send", { receiverId });
    const req = res;

    if (req) {
      setStatus(req.success);
      alert("Request sent");
    }
  };

  // UI
  if (status === "approved") {
    return (
      <p className="text-green-600 font-semibold">
        Number: {receiverNumber}
      </p>
    );
  }

  if (status === "pending") {
    return (
      <p className="text-yellow-600 font-semibold">
        Request Sent
      </p>
    );
  }

  return (
    <button
      onClick={sendRequest}
      className="text-blue-600 font-medium hover:underline"
    >
      Request Number
    </button>
  );
}
