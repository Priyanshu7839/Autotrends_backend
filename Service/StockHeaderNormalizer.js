const headerMap = {
  "Stock Age": ["Stock Age", "Ageing"],
  Model: ["Model", "Model Group"],
  Variant: ["Variant", "Model Description"],
  "Exterior Color Name": ["Exterior Color Name", "Color"],
  "Vin Number": ["Vin Number", "VIN"],
  "Stock Status": ["Stock Status", "Vehicle Status"],
  "Basic Price": ["Basic Price", "Net Dealer Price"],
};

function normalizeStockRecord(record) {
  const normalized = {};

  for (const [canonicalKey, aliases] of Object.entries(headerMap)) {
    // console.log("\n👉 Checking canonical key:", canonicalKey);
    // console.log("   Possible aliases:", aliases);

    for (const alias of aliases) {
      //   console.log("      Checking alias:", alias);

      if (record[alias] !== undefined) {
        // console.log("      ✅ Found match:", alias, "→", record[alias]);
        normalized[canonicalKey] = record[alias]; // keep only normalized
        break; // stop after first match
      }
    }
  }

  // Add untouched keys that weren’t mapped
  for (const key of Object.keys(record)) {
    const isAlias = Object.values(headerMap).some((aliases) =>
      aliases.includes(key)
    );
    if (!isAlias) {
      normalized[key] = record[key];
    }
  }

  return normalized;
}

function normalizeStockArray(rows, headerMap) {
  return rows.map((row) => ({
    ...row, // keep everything else
    stock_data: normalizeStockRecord(row.stock_data, headerMap), // only normalize stock_data
  }));
}

module.exports = { normalizeStockArray };
