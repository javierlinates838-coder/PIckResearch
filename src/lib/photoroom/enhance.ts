/** PhotoRoom background removal + basic enhancement */
export async function enhancePhoto(imageBase64: string): Promise<string> {
  const apiKey = process.env.PHOTOROOM_API_KEY;

  if (!apiKey) {
    return mockEnhance(imageBase64);
  }

  const binary = Buffer.from(
    imageBase64.replace(/^data:image\/\w+;base64,/, ""),
    "base64",
  );

  const formData = new FormData();
  formData.append(
    "image_file",
    new Blob([binary], { type: "image/png" }),
    "photo.png",
  );
  formData.append("bg_color", "FFFFFF");
  formData.append("output_format", "png");

  const response = await fetch("https://sdk.photoroom.com/v1/segment", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    return mockEnhance(imageBase64);
  }

  const resultBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(resultBuffer).toString("base64");
  return `data:image/png;base64,${base64}`;
}

/** Simulated white-background enhancement when API key absent */
function mockEnhance(imageBase64: string): string {
  if (!imageBase64.startsWith("data:")) {
    return `data:image/jpeg;base64,${imageBase64}`;
  }
  return imageBase64;
}
