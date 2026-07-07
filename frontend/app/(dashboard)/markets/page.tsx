"use client";

const markets = [
  ["Bitcoin", "$118,250", "+2.3%"],
  ["Ethereum", "$3,850", "+4.8%"],
  ["Polygon", "$0.71", "+1.2%"],
  ["Chainlink", "$17.42", "-0.8%"],
];

export default function MarketsPage() {
  return (
    <div>

      <h1 className="mb-8 text-4xl font-bold text-white">
        Markets
      </h1>

      <div className="rounded-2xl bg-zinc-900 p-6">

        <table className="w-full">

          <thead>

            <tr className="border-b border-zinc-700">

              <th className="pb-4 text-left">Coin</th>

              <th>Price</th>

              <th>24H</th>

            </tr>

          </thead>

          <tbody>

            {markets.map((m) => (

              <tr
                key={m[0]}
                className="border-b border-zinc-800"
              >

                <td className="py-4">{m[0]}</td>

                <td>{m[1]}</td>

                <td
                  className={
                    m[2].includes("-")
                      ? "text-red-400"
                      : "text-green-400"
                  }
                >
                  {m[2]}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}