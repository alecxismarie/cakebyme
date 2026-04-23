import { NextResponse } from "next/server";

type OrderType = "diy" | "doneForYou";

type OrderPayload = {
  orderType?: OrderType;
  flavor?: string;
  sprinkleTheme?: string;
  baseColor?: string;
  pipingColors?: string[];
  addOns?: {
    candle?: boolean;
    candleColor?: string;
    topper?: boolean;
    topperType?: string;
    extraFrosting?: boolean;
    extraFrostingColor?: string;
  };
  theme?: string;
  customerName?: string;
  mobileNumber?: string;
  email?: string;
  fulfillmentMethod?: "pickup" | "delivery";
  customerAddress?: string;
  preferredDate?: string;
  preferredTime?: string;
};

function hasTextValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Request body must be an object." },
      { status: 400 },
    );
  }

  const data = body as OrderPayload;
  const errors: string[] = [];

  if (data.orderType !== "diy" && data.orderType !== "doneForYou") {
    errors.push("Please choose a valid order type.");
  }

  if (!hasTextValue(data.customerName)) {
    errors.push("Customer name is required.");
  }

  if (!hasTextValue(data.mobileNumber)) {
    errors.push("Mobile number is required.");
  }

  if (data.fulfillmentMethod !== "pickup" && data.fulfillmentMethod !== "delivery") {
    errors.push("Please choose pickup or delivery.");
  }
  if (data.fulfillmentMethod === "delivery" && !hasTextValue(data.customerAddress)) {
    errors.push("Address is required for delivery orders.");
  }

  if (!hasTextValue(data.preferredDate)) {
    errors.push("Preferred date is required.");
  }

  if (!hasTextValue(data.preferredTime)) {
    errors.push("Preferred time is required.");
  }

  if (hasTextValue(data.email) && !isValidEmail(data.email.trim())) {
    errors.push("Please provide a valid email or leave it blank.");
  }

  if (data.orderType === "diy") {
    if (!hasTextValue(data.flavor)) {
      errors.push("DIY flavor is required.");
    }
    if (!hasTextValue(data.sprinkleTheme)) {
      errors.push("DIY sprinkle theme is required.");
    }
    if (!hasTextValue(data.baseColor)) {
      errors.push("DIY base color is required.");
    }
    if (!Array.isArray(data.pipingColors) || data.pipingColors.length !== 2) {
      errors.push("DIY piping colors must contain exactly 2 selections.");
    }
    if (data.addOns?.candle && !hasTextValue(data.addOns.candleColor)) {
      errors.push("Candle color is required when candle is selected.");
    }
    if (data.addOns?.topper && !hasTextValue(data.addOns.topperType)) {
      errors.push("Topper option is required when topper is selected.");
    }
    if (data.addOns?.extraFrosting && !hasTextValue(data.addOns.extraFrostingColor)) {
      errors.push("Extra frosting color is required when extra frosting is selected.");
    }
  }

  if (data.orderType === "doneForYou" && !hasTextValue(data.theme)) {
    errors.push("Done-for-You theme is required.");
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: errors,
      },
      { status: 422 },
    );
  }

  // TODO: Replace with fulfillment integration (DB + notifications).
  const reference = `CBM-${Date.now().toString().slice(-6)}`;

  return NextResponse.json(
    {
      reference,
      message: "Thanks! We received your order request and will confirm availability soon.",
    },
    { status: 201 },
  );
}
