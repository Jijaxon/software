// NUMERIC ustunlar pg'dan string bo'lib keladi — ularni songa aylantiramiz
const numericFields = new Set([
  'price', 'salePrice', 'totalStock', 'averageReview', 'totalAmount', 'reviewValue',
  'subtotal', 'deliveryFee', 'discountAmount', 'bonusUsed', 'bonusBalance',
  'discountValue', 'minOrder', 'amount',
]);

function toRecord(row) {
  if (!row) return null;
  const record = {};
  for (const [key, value] of Object.entries(row)) {
    const field = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    record[field] = numericFields.has(field) && value !== null ? Number(value) : value;
  }
  if (record.id) record._id = record.id;
  return record;
}

function toRecords(rows) {
  return rows.map(toRecord);
}

module.exports = { toRecord, toRecords };
