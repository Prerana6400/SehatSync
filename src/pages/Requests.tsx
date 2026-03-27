import { useEffect, useState } from "react";

export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => setRequests(data));
  }, []);

  return (
    <div>
      <h2>Requests</h2>

      {requests.map((r: any) => (
        <div key={r.id}>
          <p>Phone: {r.phone}</p>
          <p>Type: {r.type}</p>
          <p>Status: {r.status}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}