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

export default function NumberRequestButton({ receiverId, compact = false }) {
  const [status, setStatus] = useState(null);
  const [receiverNumber, setReceiverNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch status
  useEffect(() => {
    if (!receiverId) return undefined;
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
        } else {
          setReceiverNumber("");
        }
      })
      .catch(() => {});
  }, [receiverId]);

  // Send request
  const sendRequest = async () => {
    if (!receiverId) return;
    setLoading(true);
    try {
      const res = await post("/found/request/send", { receiverId });
      if (res?.request?.status) {
        setStatus(res.request.status);
      } else {
        setStatus("pending");
      }
      // refresh to fetch phone immediately if it was already approved
      const refreshed = await get(`/found/request/status/${receiverId}`).catch(() => null);
      if (refreshed?.status) {
        setStatus(refreshed.status);
        if (refreshed.status === "approved" && refreshed.receiverPhone) {
          setReceiverNumber(refreshed.receiverPhone);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // UI
  if (status === "approved") {
    return (
      <p className={compact ? "text-sm font-semibold text-green-700" : "text-green-600 font-semibold"}>
        {compact ? receiverNumber : `Number: ${receiverNumber || "—"}`}
      </p>
    );
  }

  if (status === "pending") {
    return (
      <p className={compact ? "text-sm font-semibold text-amber-700" : "text-yellow-600 font-semibold"}>
        Request Sent
      </p>
    );
  }

  if (status === "rejected") {
    return (
      <button
        onClick={sendRequest}
        disabled={loading}
        className={
          compact
            ? "text-sm font-semibold text-slate-700 hover:underline disabled:opacity-60"
            : "text-slate-700 font-medium hover:underline disabled:opacity-60"
        }
      >
        {loading ? "Sending…" : "Request Again"}
      </button>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={loading}
      className={
        compact
          ? "text-sm font-semibold text-blue-700 hover:underline disabled:opacity-60"
          : "text-blue-600 font-medium hover:underline disabled:opacity-60"
      }
    >
      {loading ? "Sending…" : "Request Number"}
    </button>
  );
}
