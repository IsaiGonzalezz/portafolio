import { Code128 } from "./Code128";

export type TicketData = {
  company: string;
  rfc: string;
  order: string;
  formula: string;
  ingredient: string;
  gross: string;
  tare: string;
  net: string;
  at: string;
};

export type TicketLabels = {
  ingredient: string;
  gross: string;
  tare: string;
  net: string;
};

/** Ticket de pesaje con los mismos campos que la plantilla «formulación / pesaje». */
export function ThermalTicket({ data, labels }: { data: TicketData; labels: TicketLabels }) {
  return (
    <div className="thermal w-[236px] px-4 pb-5 pt-4 text-[11px] leading-[1.45]">
      <div className="flex h-9 items-center justify-center border border-dashed border-black/30 text-[10px] text-black/50">
        LOGO
      </div>
      <p className="mt-2 text-center text-[12px] font-medium">{data.company}</p>
      <p className="text-center text-black/70">RFC: {data.rfc}</p>
      <hr className="my-2 border-black/80" />
      <p className="text-center font-medium">
        OP: {data.order} | Form: {data.formula}
      </p>
      <p className="mt-2 text-center text-black/70">{labels.ingredient}</p>
      <p className="text-center text-[18px] font-medium leading-tight">{data.ingredient}</p>
      <hr className="my-2 border-black/80" />
      <p>
        {labels.gross}: {data.gross} kg
      </p>
      <p>
        {labels.tare}: {data.tare} kg
      </p>
      <p className="text-[14px] font-medium">
        {labels.net}: {data.net} kg
      </p>
      <Code128 value={data.order} className="mx-auto mt-3 h-10 w-[180px]" />
      <p className="mt-2 text-center text-[10px] text-black/60">{data.at}</p>
    </div>
  );
}
