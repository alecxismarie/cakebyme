"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";

type OrderType = "diy" | "doneForYou";

type AddOns = {
  candle: boolean;
  candleColor: "" | "white" | "pink" | "blue" | "yellow";
  topper: boolean;
  topperType: "" | "birthday" | "anniversary" | "congrats";
  extraFrosting: boolean;
  extraFrostingColor: string;
  extraSprinkles: boolean;
};

type OrderFormData = {
  orderType: OrderType | "";
  flavor: string;
  sprinkleTheme: string;
  baseColor: string;
  pipingColors: string[];
  addOns: AddOns;
  theme: string;
  preferredPalette: string;
  dedicationText: string;
  inspirationNotes: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  fulfillmentMethod: "" | "pickup" | "delivery";
  customerAddress: string;
  preferredDate: string;
  preferredTime: string;
  additionalNotes: string;
};

const PAGE_COPY = {
  brand: "Cake by Me",
  subtitle:
    "Bento cakes made simple - choose your style and place your order in minutes.",
  diySubtitle: "Create something sweet, made by you.",
  doneSubtitle: "No time to decorate? Let us do it for you.",
  notes: [
    "Topper designs available in our catalog.",
    "Availability will be confirmed after order.",
    "Perfect for gifting or celebrations.",
  ],
  pricingPlaceholder: "Pricing will be confirmed after design review.",
} as const;

const DIY_OPTIONS = {
  flavors: ["Chocolate", "Vanilla"],
  sprinkleThemes: [
    "Rainbow Party",
    "Pink Dream",
    "Chocolate Crunch",
    "Minimalist White",
    "Surprise Mix",
  ],
  colors: ["White", "Pink", "Black", "Purple"],
} as const;

const DONE_FOR_YOU_OPTIONS = {
  themes: [
    "Romantic",
    "Cute & Playful",
    "Minimalist",
    "Chocolate Lover",
    "Surprise Me",
  ],
} as const;

const TOPPER_TYPE_OPTIONS: Array<AddOns["topperType"]> = [
  "birthday",
  "anniversary",
  "congrats",
];

const CANDLE_COLOR_OPTIONS: Array<AddOns["candleColor"]> = [
  "white",
  "pink",
  "blue",
  "yellow",
];

const INITIAL_STATE: OrderFormData = {
  orderType: "",
  flavor: "",
  sprinkleTheme: "",
  baseColor: "",
  pipingColors: [],
  addOns: {
    candle: false,
    candleColor: "",
    topper: false,
    topperType: "",
    extraFrosting: false,
    extraFrostingColor: "",
    extraSprinkles: false,
  },
  theme: "",
  preferredPalette: "",
  dedicationText: "",
  inspirationNotes: "",
  customerName: "",
  mobileNumber: "",
  email: "",
  fulfillmentMethod: "",
  customerAddress: "",
  preferredDate: "",
  preferredTime: "",
  additionalNotes: "",
};

function validateOrder(data: OrderFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.orderType) {
    errors.orderType = "Please choose a product type to continue.";
  }

  if (data.orderType === "diy") {
    if (!data.flavor) {
      errors.flavor = "Pick one flavor.";
    }
    if (!data.sprinkleTheme) {
      errors.sprinkleTheme = "Pick one sprinkle theme.";
    }
    if (!data.baseColor) {
      errors.baseColor = "Pick one base color.";
    }
    if (data.pipingColors.length !== 2) {
      errors.pipingColors = "Choose exactly 2 piping colors.";
    }
    if (data.addOns.candle && !data.addOns.candleColor) {
      errors.candleColor = "Choose a candle color.";
    }
    if (data.addOns.topper && !data.addOns.topperType) {
      errors.topperType = "Choose a topper option.";
    }
    if (data.addOns.extraFrosting && !data.addOns.extraFrostingColor) {
      errors.extraFrostingColor = "Choose a frosting color for the add-on.";
    }
  }

  if (data.orderType === "doneForYou" && !data.theme) {
    errors.theme = "Pick one theme.";
  }

  if (!data.customerName.trim()) {
    errors.customerName = "Please enter your name.";
  }

  const numericMobile = data.mobileNumber.replace(/\D/g, "");
  if (!numericMobile) {
    errors.mobileNumber = "Please enter your mobile number.";
  } else if (numericMobile.length < 8) {
    errors.mobileNumber = "Mobile number looks too short.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required for order confirmation.";
  } else {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
    if (!isValidEmail) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (!data.fulfillmentMethod) {
    errors.fulfillmentMethod = "Please choose pickup or delivery.";
  }
  if (data.fulfillmentMethod === "delivery" && !data.customerAddress.trim()) {
    errors.customerAddress = "Address is required for delivery orders.";
  }

  if (!data.preferredDate) {
    errors.preferredDate = "Please choose your preferred date.";
  }

  if (!data.preferredTime) {
    errors.preferredTime = "Please choose your preferred time.";
  }

  return errors;
}

function ChoiceCard({
  id,
  name,
  label,
  checked,
  type,
  onChange,
  onBlur,
  disabled = false,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  type: "radio" | "checkbox";
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className={disabled ? "cursor-not-allowed" : "cursor-pointer"}>
      <input
        id={id}
        name={name}
        type={type}
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        onBlur={onBlur}
        disabled={disabled}
        className="peer sr-only"
      />
      <span className="flex min-h-12 items-center justify-center rounded-2xl border border-[#f3c9d8] bg-white px-4 py-3 text-sm font-medium text-[#6c4d59] shadow-sm transition hover:border-[#e9aabd] hover:bg-[#fff5f8] peer-checked:border-[#cf6e93] peer-checked:bg-[#f8c7d8] peer-checked:font-semibold peer-checked:text-[#65283f] peer-focus-visible:ring-2 peer-focus-visible:ring-[#dc7d9b] peer-focus-visible:ring-offset-2 peer-disabled:border-[#f2dce4] peer-disabled:bg-[#fbf3f6] peer-disabled:text-[#b39ba5]">
        {label}
      </span>
    </label>
  );
}

function formatTimeForSummary(timeValue: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeValue.trim());
  if (!match) {
    return timeValue;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  if (!Number.isFinite(hours) || hours < 0 || hours > 23) {
    return timeValue;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${period}`;
}

export default function Home() {
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_STATE);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState<{
    message: string;
  } | null>(null);
  const [addOnPickerOpen, setAddOnPickerOpen] = useState({
    candle: false,
    topper: false,
  });

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const errors = useMemo(() => validateOrder(formData), [formData]);
  const isFormSubmittable =
    Object.keys(errors).length === 0 && !!formData.orderType && !isSubmitting;

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function shouldShowError(field: string) {
    return Boolean(errors[field] && (submitAttempted || touched[field]));
  }

  function selectOrderType(orderType: OrderType) {
    setFormData((prev) => ({ ...prev, orderType }));
    setSubmitError("");
  }

  function setAddOnValue<K extends keyof AddOns>(key: K, value: AddOns[K]) {
    setFormData((prev) => ({
      ...prev,
      addOns: {
        ...prev.addOns,
        [key]: value,
      },
    }));
  }

  function handlePipingColorToggle(color: string, nextChecked: boolean) {
    setFormData((prev) => {
      if (!nextChecked) {
        return {
          ...prev,
          pipingColors: prev.pipingColors.filter((item) => item !== color),
        };
      }

      if (prev.pipingColors.includes(color) || prev.pipingColors.length >= 2) {
        return prev;
      }

      return {
        ...prev,
        pipingColors: [...prev.pipingColors, color],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setSubmitError("");
    setSubmitSuccess(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as {
        error?: string;
        details?: string[];
        message?: string;
        reference?: string;
      };

      if (!response.ok) {
        const failureMessage =
          payload.details?.[0] ?? payload.error ?? "Unable to submit your order.";
        throw new Error(failureMessage);
      }

      setSubmitSuccess({
        message:
          "Thank you! We’ve received your order request. Please expect a confirmation from us shortly.",
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const summaryItems = useMemo(() => {
    const items: string[] = [];

    if (formData.orderType === "diy") {
      if (formData.flavor) items.push(`Flavor: ${formData.flavor}`);
      if (formData.sprinkleTheme) {
        items.push(`Sprinkle theme: ${formData.sprinkleTheme}`);
      }
      if (formData.baseColor) items.push(`Base color: ${formData.baseColor}`);
      if (formData.pipingColors.length > 0) {
        items.push(`Piping colors: ${formData.pipingColors.join(", ")}`);
      }
      if (formData.addOns.topper) {
        items.push(
          `Add-on: Cake topper${
            formData.addOns.topperType
              ? ` (${formData.addOns.topperType.charAt(0).toUpperCase() + formData.addOns.topperType.slice(1)})`
              : ""
          }`,
        );
      }
      if (formData.addOns.candle) {
        items.push(
          `Add-on: Candle${
            formData.addOns.candleColor
              ? ` (${formData.addOns.candleColor.charAt(0).toUpperCase() + formData.addOns.candleColor.slice(1)})`
              : ""
          }`,
        );
      }
      if (formData.addOns.extraFrosting) {
        items.push(
          `Add-on: Extra frosting${formData.addOns.extraFrostingColor ? ` (${formData.addOns.extraFrostingColor})` : ""}`,
        );
      }
      if (formData.addOns.extraSprinkles) items.push("Add-on: Extra sprinkles");
    }

    if (formData.orderType === "doneForYou") {
      if (formData.theme) items.push(`Theme: ${formData.theme}`);
      if (formData.preferredPalette.trim()) {
        items.push(`Preferred palette: ${formData.preferredPalette.trim()}`);
      }
      if (formData.inspirationNotes.trim()) {
        items.push(`Inspiration notes: ${formData.inspirationNotes.trim()}`);
      }
    }

    if (formData.dedicationText.trim()) {
      items.push(`Dedication: ${formData.dedicationText.trim()}`);
    }
    if (formData.additionalNotes.trim()) {
      items.push(`Additional notes: ${formData.additionalNotes.trim()}`);
    }
    if (formData.customerAddress.trim()) {
      items.push(`Address: ${formData.customerAddress.trim()}`);
    }
    if (formData.fulfillmentMethod) {
      items.push(
        `Fulfillment: ${formData.fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}`,
      );
    }
    if (formData.preferredDate) {
      items.push(`Preferred date: ${formData.preferredDate}`);
    }
    if (formData.preferredTime) {
      items.push(`Preferred time: ${formatTimeForSummary(formData.preferredTime)}`);
    }

    return items;
  }, [formData]);

  return (
    <div className="min-h-screen bg-[#fff9f8] text-[#5f4454]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <section className="rounded-3xl border border-[#f2dbe4] bg-[#fff4f7] p-6 shadow-sm sm:p-8">
          <h1 className="sr-only">{PAGE_COPY.brand}</h1>
          <Image
            src="/cbmlogo.png"
            alt="Cake by Me logo"
            width={1536}
            height={1024}
            className="mx-auto h-auto w-full max-w-[260px]"
          />
          <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-7 text-[#7a5867] sm:mx-0 sm:text-left sm:text-lg">
            {PAGE_COPY.subtitle}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => selectOrderType("diy")}
              className="rounded-full border border-[#dc7d9b] bg-[#dc7d9b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c46887] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc7d9b] focus-visible:ring-offset-2"
            >
              Order DIY Bento Cake
            </button>
            <button
              type="button"
              onClick={() => selectOrderType("doneForYou")}
              className="rounded-full border border-[#e2a9bc] bg-white px-5 py-3 text-sm font-semibold text-[#8c5068] shadow-sm transition hover:bg-[#fff3f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc7d9b] focus-visible:ring-offset-2"
            >
              Order Done-for-You Bento Cake
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-[#8a6778] sm:text-left">
            Quick start: these buttons pre-select your cake type in Step 1 below.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <section className="rounded-3xl border border-[#f0d9e2] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-semibold text-[#6b3550]">
                Step 1: Choose your bento cake type
              </h2>
              <p className="mt-1 text-sm text-[#876676]">
                Start by choosing one product to unlock the right options below.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label htmlFor="type-diy" className="cursor-pointer">
                  <input
                    id="type-diy"
                    name="orderType"
                    type="radio"
                    className="peer sr-only"
                    checked={formData.orderType === "diy"}
                    onChange={() => selectOrderType("diy")}
                    onBlur={() => markTouched("orderType")}
                  />
                  <span className="flex h-full min-h-28 flex-col justify-between rounded-2xl border border-[#f3c9d8] bg-[#fff9fb] p-4 text-left transition hover:border-[#e9aabd] hover:bg-[#fff2f7] peer-checked:border-[#cf6e93] peer-checked:bg-[#f8c7d8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#dc7d9b] peer-focus-visible:ring-offset-2">
                    <span className="text-base font-semibold text-[#6d3b56]">
                      DIY Bento Cake
                    </span>
                    <span className="mt-2 text-sm text-[#8a6778]">
                      {PAGE_COPY.diySubtitle}
                    </span>
                  </span>
                </label>

                <label htmlFor="type-done-for-you" className="cursor-pointer">
                  <input
                    id="type-done-for-you"
                    name="orderType"
                    type="radio"
                    className="peer sr-only"
                    checked={formData.orderType === "doneForYou"}
                    onChange={() => selectOrderType("doneForYou")}
                    onBlur={() => markTouched("orderType")}
                  />
                  <span className="flex h-full min-h-28 flex-col justify-between rounded-2xl border border-[#f3c9d8] bg-[#fff9fb] p-4 text-left transition hover:border-[#e9aabd] hover:bg-[#fff2f7] peer-checked:border-[#cf6e93] peer-checked:bg-[#f8c7d8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#dc7d9b] peer-focus-visible:ring-offset-2">
                    <span className="text-base font-semibold text-[#6d3b56]">
                      Done-for-You Bento Cake
                    </span>
                    <span className="mt-2 text-sm text-[#8a6778]">
                      {PAGE_COPY.doneSubtitle}
                    </span>
                  </span>
                </label>
              </div>

              {shouldShowError("orderType") && (
                <p className="mt-3 text-sm text-[#be3f62]" role="alert">
                  {errors.orderType}
                </p>
              )}
            </section>

            {formData.orderType === "diy" && (
              <section className="rounded-3xl border border-[#f0d9e2] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-semibold text-[#6b3550]">
                  Step 2: DIY Bento Cake details
                </h2>
                <p className="mt-1 text-sm text-[#876676]">
                  Includes 1 Bento Cake, 2 piping bags (your chosen colors), 1
                  sprinkle theme, and optional candle.
                </p>

                <div className="mt-5 space-y-6">
                  <fieldset>
                    <legend className="text-sm font-semibold text-[#6e3e58]">
                      Flavor (required)
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {DIY_OPTIONS.flavors.map((flavor) => (
                        <ChoiceCard
                          key={flavor}
                          id={`flavor-${flavor}`}
                          name="flavor"
                          label={flavor}
                          checked={formData.flavor === flavor}
                          type="radio"
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, flavor }))
                          }
                          onBlur={() => markTouched("flavor")}
                        />
                      ))}
                    </div>
                    {shouldShowError("flavor") && (
                      <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                        {errors.flavor}
                      </p>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend className="text-sm font-semibold text-[#6e3e58]">
                      Sprinkle Theme (required)
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {DIY_OPTIONS.sprinkleThemes.map((theme) => (
                        <ChoiceCard
                          key={theme}
                          id={`sprinkle-${theme}`}
                          name="sprinkleTheme"
                          label={theme}
                          checked={formData.sprinkleTheme === theme}
                          type="radio"
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, sprinkleTheme: theme }))
                          }
                          onBlur={() => markTouched("sprinkleTheme")}
                        />
                      ))}
                    </div>
                    {shouldShowError("sprinkleTheme") && (
                      <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                        {errors.sprinkleTheme}
                      </p>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend className="text-sm font-semibold text-[#6e3e58]">
                      Base Color / Buttercream Color (required)
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {DIY_OPTIONS.colors.map((color) => (
                        <ChoiceCard
                          key={color}
                          id={`base-${color}`}
                          name="baseColor"
                          label={color}
                          checked={formData.baseColor === color}
                          type="radio"
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, baseColor: color }))
                          }
                          onBlur={() => markTouched("baseColor")}
                        />
                      ))}
                    </div>
                    {shouldShowError("baseColor") && (
                      <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                        {errors.baseColor}
                      </p>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend className="text-sm font-semibold text-[#6e3e58]">
                      Piping Colors (pick exactly 2)
                    </legend>
                    <p className="mt-1 text-xs text-[#92707f]">
                      Selected: {formData.pipingColors.length}/2
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {DIY_OPTIONS.colors.map((color) => {
                        const checked = formData.pipingColors.includes(color);
                        const isDisabled =
                          !checked && formData.pipingColors.length >= 2;

                        return (
                          <ChoiceCard
                            key={color}
                            id={`piping-${color}`}
                            name="pipingColors"
                            label={color}
                            checked={checked}
                            type="checkbox"
                            disabled={isDisabled}
                            onChange={(nextChecked) =>
                              handlePipingColorToggle(color, nextChecked)
                            }
                            onBlur={() => markTouched("pipingColors")}
                          />
                        );
                      })}
                    </div>
                    {shouldShowError("pipingColors") && (
                      <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                        {errors.pipingColors}
                      </p>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend className="text-sm font-semibold text-[#6e3e58]">
                      Optional add-ons
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <ChoiceCard
                        id="addon-candle"
                        name="addon-candle"
                        label="1 Candle"
                        checked={formData.addOns.candle}
                        type="checkbox"
                        onChange={(checked) => {
                          setAddOnValue("candle", checked);
                          if (checked) {
                            setAddOnPickerOpen((prev) => ({ ...prev, candle: true }));
                          } else {
                            setAddOnValue("candleColor", "");
                            setAddOnPickerOpen((prev) => ({ ...prev, candle: false }));
                          }
                        }}
                      />
                      <ChoiceCard
                        id="addon-topper"
                        name="addon-topper"
                        label="Cake Topper"
                        checked={formData.addOns.topper}
                        type="checkbox"
                        onChange={(checked) => {
                          setAddOnValue("topper", checked);
                          if (checked) {
                            setAddOnPickerOpen((prev) => ({ ...prev, topper: true }));
                          } else {
                            setAddOnValue("topperType", "");
                            setAddOnPickerOpen((prev) => ({ ...prev, topper: false }));
                          }
                        }}
                      />
                      <ChoiceCard
                        id="addon-frosting"
                        name="addon-frosting"
                        label="1 Extra Frosting"
                        checked={formData.addOns.extraFrosting}
                        type="checkbox"
                        onChange={(checked) => {
                          setAddOnValue("extraFrosting", checked);
                          if (!checked) {
                            setAddOnValue("extraFrostingColor", "");
                          }
                        }}
                      />
                      <ChoiceCard
                        id="addon-sprinkles"
                        name="addon-sprinkles"
                        label="1 Extra Sprinkles"
                        checked={formData.addOns.extraSprinkles}
                        type="checkbox"
                        onChange={(checked) =>
                          setAddOnValue("extraSprinkles", checked)
                        }
                      />
                    </div>

                    {formData.addOns.candle && (
                      <div className="mt-3 rounded-2xl border border-[#f2dbe4] bg-[#fff9fb] p-3">
                        <p className="text-sm text-[#7f6170]">
                          Choose candle color.
                        </p>
                        {addOnPickerOpen.candle || !formData.addOns.candleColor ? (
                          <fieldset className="mt-2">
                            <legend className="text-sm font-medium text-[#6e3e58]">
                              Candle color (required)
                            </legend>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {CANDLE_COLOR_OPTIONS.map((color) => (
                                <ChoiceCard
                                  key={color}
                                  id={`candle-color-${color}`}
                                  name="candleColor"
                                  label={color.charAt(0).toUpperCase() + color.slice(1)}
                                  checked={formData.addOns.candleColor === color}
                                  type="radio"
                                  onChange={() => {
                                    setAddOnValue("candleColor", color);
                                    setAddOnPickerOpen((prev) => ({
                                      ...prev,
                                      candle: false,
                                    }));
                                  }}
                                  onBlur={() => markTouched("candleColor")}
                                />
                              ))}
                            </div>
                            {shouldShowError("candleColor") && (
                              <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                                {errors.candleColor}
                              </p>
                            )}
                          </fieldset>
                        ) : (
                          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#f2dce4] bg-white px-3 py-2">
                            <p className="text-sm text-[#6f4f60]">
                              Candle color:{" "}
                              <span className="font-semibold">
                                {formData.addOns.candleColor.charAt(0).toUpperCase() +
                                  formData.addOns.candleColor.slice(1)}
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setAddOnPickerOpen((prev) => ({
                                  ...prev,
                                  candle: true,
                                }))
                              }
                              className="rounded-full border border-[#e2a9bc] bg-white px-3 py-1 text-xs font-semibold text-[#8c5068] transition hover:bg-[#fff3f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc7d9b] focus-visible:ring-offset-2"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.addOns.topper && (
                      <div className="mt-3 rounded-2xl border border-[#f2dbe4] bg-[#fff9fb] p-3">
                        <p className="text-sm text-[#7f6170]">
                          Topper designs available in our catalog.
                        </p>
                        {addOnPickerOpen.topper || !formData.addOns.topperType ? (
                          <fieldset className="mt-2">
                            <legend className="text-sm font-medium text-[#6e3e58]">
                              Topper option (required)
                            </legend>
                            <div className="mt-2 grid gap-2 sm:grid-cols-3">
                              {TOPPER_TYPE_OPTIONS.map((option) => (
                                <ChoiceCard
                                  key={option}
                                  id={`topper-type-${option}`}
                                  name="topperType"
                                  label={option.charAt(0).toUpperCase() + option.slice(1)}
                                  checked={formData.addOns.topperType === option}
                                  type="radio"
                                  onChange={() => {
                                    setAddOnValue("topperType", option);
                                    setAddOnPickerOpen((prev) => ({
                                      ...prev,
                                      topper: false,
                                    }));
                                  }}
                                  onBlur={() => markTouched("topperType")}
                                />
                              ))}
                            </div>
                            {shouldShowError("topperType") && (
                              <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                                {errors.topperType}
                              </p>
                            )}
                          </fieldset>
                        ) : (
                          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#f2dce4] bg-white px-3 py-2">
                            <p className="text-sm text-[#6f4f60]">
                              Topper option:{" "}
                              <span className="font-semibold">
                                {formData.addOns.topperType.charAt(0).toUpperCase() +
                                  formData.addOns.topperType.slice(1)}
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setAddOnPickerOpen((prev) => ({
                                  ...prev,
                                  topper: true,
                                }))
                              }
                              className="rounded-full border border-[#e2a9bc] bg-white px-3 py-1 text-xs font-semibold text-[#8c5068] transition hover:bg-[#fff3f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc7d9b] focus-visible:ring-offset-2"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.addOns.extraFrosting && (
                      <div className="mt-3 rounded-2xl border border-[#f2dbe4] bg-[#fff9fb] p-3">
                        <p className="text-sm font-medium text-[#6e3e58]">
                          Extra frosting color (required for this add-on)
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {DIY_OPTIONS.colors.map((color) => (
                            <ChoiceCard
                              key={`extra-frosting-${color}`}
                              id={`extra-frosting-${color}`}
                              name="extraFrostingColor"
                              label={color}
                              checked={formData.addOns.extraFrostingColor === color}
                              type="radio"
                              onChange={() =>
                                setAddOnValue("extraFrostingColor", color)
                              }
                              onBlur={() => markTouched("extraFrostingColor")}
                            />
                          ))}
                        </div>
                        {shouldShowError("extraFrostingColor") && (
                          <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                            {errors.extraFrostingColor}
                          </p>
                        )}
                      </div>
                    )}
                  </fieldset>
                </div>
              </section>
            )}

            {formData.orderType === "doneForYou" && (
              <section className="rounded-3xl border border-[#f0d9e2] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-semibold text-[#6b3550]">
                  Step 2: Done-for-You details
                </h2>
                <p className="mt-1 text-sm text-[#876676]">
                  Includes styled color palette, matching sprinkle theme, cake
                  topper, and custom dedication.
                </p>

                <div className="mt-5 space-y-6">
                  <fieldset>
                    <legend className="text-sm font-semibold text-[#6e3e58]">
                      Theme (required)
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {DONE_FOR_YOU_OPTIONS.themes.map((theme) => (
                        <ChoiceCard
                          key={theme}
                          id={`theme-${theme}`}
                          name="theme"
                          label={theme}
                          checked={formData.theme === theme}
                          type="radio"
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, theme }))
                          }
                          onBlur={() => markTouched("theme")}
                        />
                      ))}
                    </div>
                    {shouldShowError("theme") && (
                      <p className="mt-2 text-sm text-[#be3f62]" role="alert">
                        {errors.theme}
                      </p>
                    )}
                  </fieldset>

                  <div>
                    <label
                      className="block text-sm font-semibold text-[#6e3e58]"
                      htmlFor="preferredPalette"
                    >
                      Preferred color palette (optional)
                    </label>
                    <input
                      id="preferredPalette"
                      type="text"
                      value={formData.preferredPalette}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          preferredPalette: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                      placeholder="Example: Soft pink + cream"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-[#6e3e58]"
                      htmlFor="inspirationNotes"
                    >
                      Notes for inspiration / request (optional)
                    </label>
                    <textarea
                      id="inspirationNotes"
                      value={formData.inspirationNotes}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          inspirationNotes: event.target.value,
                        }))
                      }
                      rows={4}
                      className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                      placeholder="Tell us the mood, event, or style you're going for."
                    />
                  </div>
                </div>
              </section>
            )}

            {!formData.orderType && (
              <section className="rounded-3xl border border-dashed border-[#eccfda] bg-white p-5 text-sm text-[#8a6979] shadow-sm sm:p-6">
                Select a product type in Step 1 to continue with your options.
              </section>
            )}

            <section className="rounded-3xl border border-[#f0d9e2] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-semibold text-[#6b3550]">
                Step 3: Contact and order details
              </h2>
              <p className="mt-1 text-sm text-[#876676]">
                Share your details so we can confirm availability and finalize your
                order.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="customerName"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Customer name (required)
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerName: event.target.value,
                      }))
                    }
                    onBlur={() => markTouched("customerName")}
                    className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                    placeholder="Your full name"
                  />
                  {shouldShowError("customerName") && (
                    <p className="mt-1 text-sm text-[#be3f62]" role="alert">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Mobile number (required)
                  </label>
                  <input
                    id="mobileNumber"
                    type="tel"
                    inputMode="tel"
                    value={formData.mobileNumber}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        mobileNumber: event.target.value,
                      }))
                    }
                    onBlur={() => markTouched("mobileNumber")}
                    className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                    placeholder="+65 9123 4567"
                  />
                  {shouldShowError("mobileNumber") && (
                    <p className="mt-1 text-sm text-[#be3f62]" role="alert">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Email (required)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    onBlur={() => markTouched("email")}
                    className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                    placeholder="name@email.com"
                  />
                  {shouldShowError("email") && (
                    <p className="mt-1 text-sm text-[#be3f62]" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <fieldset>
                    <legend className="text-sm font-semibold text-[#6e3e58]">
                      Pickup or delivery (required)
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <ChoiceCard
                        id="fulfillment-pickup"
                        name="fulfillmentMethod"
                        label="Pickup"
                        checked={formData.fulfillmentMethod === "pickup"}
                        type="radio"
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            fulfillmentMethod: "pickup",
                          }))
                        }
                        onBlur={() => markTouched("fulfillmentMethod")}
                      />
                      <ChoiceCard
                        id="fulfillment-delivery"
                        name="fulfillmentMethod"
                        label="Delivery"
                        checked={formData.fulfillmentMethod === "delivery"}
                        type="radio"
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            fulfillmentMethod: "delivery",
                          }))
                        }
                        onBlur={() => markTouched("fulfillmentMethod")}
                      />
                    </div>
                    {shouldShowError("fulfillmentMethod") && (
                      <p className="mt-1 text-sm text-[#be3f62]" role="alert">
                        {errors.fulfillmentMethod}
                      </p>
                    )}
                  </fieldset>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="customerAddress"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Customer address{" "}
                    {formData.fulfillmentMethod === "delivery"
                      ? "(required for delivery)"
                      : "(optional for pickup)"}
                  </label>
                  <textarea
                    id="customerAddress"
                    rows={3}
                    value={formData.customerAddress}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerAddress: event.target.value,
                      }))
                    }
                    onBlur={() => markTouched("customerAddress")}
                    className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                    placeholder="Full address (for delivery or easier coordination)"
                  />
                  {shouldShowError("customerAddress") && (
                    <p className="mt-1 text-sm text-[#be3f62]" role="alert">
                      {errors.customerAddress}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="preferredDate"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Preferred pickup/delivery date (required)
                  </label>
                  <input
                    id="preferredDate"
                    type="date"
                    min={today}
                    value={formData.preferredDate}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredDate: event.target.value,
                      }))
                    }
                    onBlur={() => markTouched("preferredDate")}
                    className="mt-2 block w-full max-w-full min-w-0 rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                  />
                  {shouldShowError("preferredDate") && (
                    <p className="mt-1 text-sm text-[#be3f62]" role="alert">
                      {errors.preferredDate}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="preferredTime"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Preferred time (required)
                  </label>
                  <input
                    id="preferredTime"
                    type="time"
                    value={formData.preferredTime}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredTime: event.target.value,
                      }))
                    }
                    onBlur={() => markTouched("preferredTime")}
                    className="mt-2 block w-full max-w-full min-w-0 rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                  />
                  {shouldShowError("preferredTime") && (
                    <p className="mt-1 text-sm text-[#be3f62]" role="alert">
                      {errors.preferredTime}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="dedicationText"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Message / dedication text
                  </label>
                  <input
                    id="dedicationText"
                    type="text"
                    value={formData.dedicationText}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        dedicationText: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                    placeholder="Example: Happy Birthday, Sara!"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="additionalNotes"
                    className="text-sm font-semibold text-[#6e3e58]"
                  >
                    Additional notes
                  </label>
                  <textarea
                    id="additionalNotes"
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        additionalNotes: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-[#f1dce4] bg-white px-3 py-2 text-sm text-[#5f4454] shadow-sm outline-none transition focus:border-[#dc7d9b] focus:ring-2 focus:ring-[#f8cad8]"
                    placeholder="Allergies, gift timing, or anything else we should know."
                  />
                </div>
              </div>

              {submitError && (
                <p className="mt-4 rounded-xl border border-[#f1b5c7] bg-[#ffeef4] px-3 py-2 text-sm text-[#a53b5e]">
                  {submitError}
                </p>
              )}

              {submitSuccess && (
                <div className="mt-4 rounded-xl border border-[#cde8d8] bg-[#f1fff7] px-3 py-3 text-sm text-[#2e6b4c]">
                  <p className="font-semibold">Order request submitted.</p>
                  <p className="mt-1">{submitSuccess.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormSubmittable}
                className="mt-5 w-full rounded-full border border-[#dc7d9b] bg-[#dc7d9b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c46887] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc7d9b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#e8bccb] disabled:bg-[#e8bccb]"
              >
                {isSubmitting ? "Submitting..." : "Submit Order"}
              </button>
            </section>

          </form>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-3xl border border-[#f0d9e2] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-semibold text-[#6b3550]">Live order summary</h2>
              <p className="mt-1 text-sm text-[#876676]">
                Review your selections before submitting.
              </p>

              <div className="mt-4 rounded-2xl bg-[#fff7fa] p-4">
                <p className="text-xs uppercase tracking-wide text-[#a07084]">Selected product</p>
                <p className="mt-1 break-words text-sm font-semibold text-[#6d3b56]">
                  {formData.orderType === "diy" && "DIY Bento Cake"}
                  {formData.orderType === "doneForYou" && "Done-for-You Bento Cake"}
                  {!formData.orderType && "No selection yet"}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-[#a07084]">Selections</p>
                {summaryItems.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm text-[#6f4f60]">
                    {summaryItems.map((item) => (
                      <li
                        key={item}
                        className="rounded-xl border border-[#f2dce4] bg-[#fffcfd] px-3 py-2 break-words"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[#92707f]">
                    Your selected options will appear here.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-[#eac6d4] bg-[#fff8fb] p-4">
                <p className="text-xs uppercase tracking-wide text-[#a07084]">
                  Estimated price
                </p>
                <p className="mt-1 text-sm font-medium text-[#7b5a6a]">TBD</p>
                <p className="mt-1 text-xs text-[#9a7888]">
                  {PAGE_COPY.pricingPlaceholder}
                </p>
              </div>

              <p className="mt-5 text-center text-sm text-[#8a6778]">
                Ready to order? Use the <span className="font-semibold">Submit Order</span>{" "}
                button in Step 3.
              </p>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
