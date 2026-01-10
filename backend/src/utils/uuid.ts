import { randomBytes } from "crypto";

/**
 * Generates a UUID v7 (time-ordered UUID).
 *
 * Format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
 * - t: 48-bit Unix timestamp in milliseconds
 * - 7: version (7)
 * - x: random bits
 * - y: variant (8, 9, a, or b)
 */
export function generateUUIDv7(): string {
  const timestamp = Date.now();

  // 48-bit timestamp (6 bytes)
  const timestampBytes = Buffer.alloc(6);
  timestampBytes.writeUIntBE(timestamp, 0, 6);

  // 10 random bytes
  const randomBytesBuffer = randomBytes(10);

  // Construct the UUID bytes (16 bytes total)
  const uuidBytes = Buffer.alloc(16);

  // Bytes 0-5: timestamp
  timestampBytes.copy(uuidBytes, 0);

  // Bytes 6-7: version (7) + random
  uuidBytes[6] = 0x70 | (randomBytesBuffer.readUInt8(0) & 0x0f);
  uuidBytes[7] = randomBytesBuffer.readUInt8(1);

  // Bytes 8-9: variant (10xx) + random
  uuidBytes[8] = 0x80 | (randomBytesBuffer.readUInt8(2) & 0x3f);
  uuidBytes[9] = randomBytesBuffer.readUInt8(3);

  // Bytes 10-15: random
  randomBytesBuffer.copy(uuidBytes, 10, 4, 10);

  // Format as UUID string
  const hex = uuidBytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
