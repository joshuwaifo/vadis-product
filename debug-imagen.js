import Replicate from "replicate";

async function testImagen() {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    console.log("Testing Imagen-4 response format...");
    
    const input = {
      prompt: "A simple test image: a red apple on a white background",
      aspect_ratio: "16:9",
      safety_filter_level: "block_medium_and_above"
    };

    console.log("Input:", JSON.stringify(input, null, 2));
    
    const output = await replicate.run("google/imagen-4", { input });
    
    console.log("=== RAW OUTPUT ===");
    console.log("Type:", typeof output);
    console.log("Value:", JSON.stringify(output, null, 2));
    console.log("String representation:", String(output));
    
    if (Array.isArray(output)) {
      console.log("Array length:", output.length);
      output.forEach((item, i) => {
        console.log(`Item ${i}:`, typeof item, item);
      });
    }
    
    if (typeof output === 'object' && output !== null) {
      console.log("Object keys:", Object.keys(output));
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testImagen();