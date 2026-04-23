import { NextResponse } from "next/server";

type OrderType = "diy" | "doneForYou";
type FulfillmentMethod = "pickup" | "delivery";

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
    extraSprinkles?: boolean;
  };
  theme?: string;
  preferredPalette?: string;
  dedicationText?: string;
  inspirationNotes?: string;
  customerName?: string;
  mobileNumber?: string;
  email?: string;
  fulfillmentMethod?: FulfillmentMethod;
  customerAddress?: string;
  preferredDate?: string;
  preferredTime?: string;
  additionalNotes?: string;
};

class OrderRouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function hasTextValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildOrderSummary(data: OrderPayload, reference: string): string[] {
  const lines: string[] = [`Reference: ${reference}`];

  if (data.orderType === "diy") {
    lines.push("Product: DIY Bento Cake");
    if (hasTextValue(data.flavor)) lines.push(`Flavor: ${data.flavor}`);
    if (hasTextValue(data.sprinkleTheme)) {
      lines.push(`Sprinkle theme: ${data.sprinkleTheme}`);
    }
    if (hasTextValue(data.baseColor)) lines.push(`Base color: ${data.baseColor}`);
    if (Array.isArray(data.pipingColors) && data.pipingColors.length > 0) {
      lines.push(`Piping colors: ${data.pipingColors.join(", ")}`);
    }
  } else if (data.orderType === "doneForYou") {
    lines.push("Product: Done-for-You Bento Cake");
    if (hasTextValue(data.theme)) lines.push(`Theme: ${data.theme}`);
    if (hasTextValue(data.preferredPalette)) {
      lines.push(`Preferred palette: ${data.preferredPalette}`);
    }
  }

  if (data.addOns?.candle) {
    lines.push(
      `Add-on: Candle${hasTextValue(data.addOns.candleColor) ? ` (${formatLabel(data.addOns.candleColor)})` : ""}`,
    );
  }
  if (data.addOns?.topper) {
    lines.push(
      `Add-on: Cake topper${hasTextValue(data.addOns.topperType) ? ` (${formatLabel(data.addOns.topperType)})` : ""}`,
    );
  }
  if (data.addOns?.extraFrosting) {
    lines.push(
      `Add-on: Extra frosting${hasTextValue(data.addOns.extraFrostingColor) ? ` (${data.addOns.extraFrostingColor})` : ""}`,
    );
  }
  if (data.addOns?.extraSprinkles) {
    lines.push("Add-on: Extra sprinkles");
  }

  if (hasTextValue(data.fulfillmentMethod)) {
    lines.push(
      `Fulfillment: ${data.fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}`,
    );
  }
  if (hasTextValue(data.preferredDate)) lines.push(`Preferred date: ${data.preferredDate}`);
  if (hasTextValue(data.preferredTime)) lines.push(`Preferred time: ${data.preferredTime}`);
  if (hasTextValue(data.dedicationText)) lines.push(`Dedication: ${data.dedicationText}`);
  if (hasTextValue(data.inspirationNotes)) {
    lines.push(`Inspiration notes: ${data.inspirationNotes}`);
  }
  if (hasTextValue(data.additionalNotes)) {
    lines.push(`Additional notes: ${data.additionalNotes}`);
  }
  if (hasTextValue(data.customerAddress)) lines.push(`Address: ${data.customerAddress}`);

  return lines;
}

async function forwardOrderToFormspree(
  data: OrderPayload,
  reference: string,
): Promise<void> {
  const formspreeEndpoint =
    process.env.FORMSPREE_ENDPOINT?.trim() ??
    process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim() ??
    "";

  if (!formspreeEndpoint) {
    return;
  }

  const response = await fetch(formspreeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...data,
      reference,
      source: "cake-by-me-order-form",
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | {
          errors?: Array<{ message?: string }>;
          error?: string;
        }
      | null;
    const message =
      errorPayload?.errors?.[0]?.message ??
      errorPayload?.error ??
      "Unable to submit your order details.";
    throw new OrderRouteError(502, message);
  }
}

async function sendBrevoConfirmationEmail(
  data: OrderPayload,
  reference: string,
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY?.trim() ?? "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() ?? "";
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "Cake by Me";

  if (!apiKey || !senderEmail) {
    throw new OrderRouteError(
      500,
      "Email confirmation is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.",
    );
  }

  if (!hasTextValue(data.email)) {
    throw new OrderRouteError(422, "Email is required for order confirmation.");
  }

  const summaryLines = buildOrderSummary(data, reference);
  const summaryHtml = summaryLines
    .map((line) => `<li style="margin-bottom:8px;">${escapeHtml(line)}</li>`)
    .join("");
  const summaryText = summaryLines.map((line) => `- ${line}`).join("\n");

  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #3b2a34; line-height: 1.5;">
      <h2 style="margin: 0 0 12px; color: #b94f79;">Order Confirmation</h2>
      <p style="margin: 0 0 12px;">Hi ${escapeHtml(data.customerName?.trim() ?? "there")},</p>
      <p style="margin: 0 0 12px;">
        Thank you for your order with Cake by Me. We received your request and will confirm availability shortly.
      </p>
      <ul style="padding-left: 18px; margin: 0 0 12px;">
        ${summaryHtml}
      </ul>
      <p style="margin: 0;">Need updates? Reply to this email and we will assist you.</p>
    </div>
  `;

  const textContent = `Order Confirmation

Hi ${data.customerName?.trim() ?? "there"},

Thank you for your order with Cake by Me. We received your request and will confirm availability shortly.

${summaryText}

Need updates? Reply to this email and we will assist you.
`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: data.email.trim(),
          name: data.customerName?.trim() || "Customer",
        },
      ],
      subject: `Cake by Me order confirmation (${reference})`,
      htmlContent,
      textContent,
      tags: ["cake-by-me", "order-confirmation"],
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | {
          message?: string;
          code?: string;
        }
      | null;
    throw new OrderRouteError(
      502,
      errorPayload?.message ??
        errorPayload?.code ??
        "Unable to send confirmation email at the moment.",
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
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

  if (!hasTextValue(data.email)) {
    errors.push("Email is required for order confirmation.");
  } else if (!isValidEmail(data.email.trim())) {
    errors.push("Please provide a valid email address.");
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

  const reference = `CBM-${Date.now().toString().slice(-6)}`;

  try {
    await forwardOrderToFormspree(data, reference);
    await sendBrevoConfirmationEmail(data, reference);
  } catch (error) {
    if (error instanceof OrderRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Unable to complete order processing. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      reference,
      message:
        "Thanks! We received your order request and sent your confirmation email.",
    },
    { status: 201 },
  );
}
