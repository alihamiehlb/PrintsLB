UPDATE materials SET createdAt = strftime('%Y-%m-%dT%H:%M:%fZ', createdAt/1000.0, 'unixepoch') WHERE typeof(createdAt) IN ('integer', 'real');
UPDATE materials SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', updatedAt/1000.0, 'unixepoch') WHERE typeof(updatedAt) IN ('integer', 'real');

UPDATE products SET createdAt = strftime('%Y-%m-%dT%H:%M:%fZ', createdAt/1000.0, 'unixepoch') WHERE typeof(createdAt) IN ('integer', 'real');
UPDATE products SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', updatedAt/1000.0, 'unixepoch') WHERE typeof(updatedAt) IN ('integer', 'real');

UPDATE users SET createdAt = strftime('%Y-%m-%dT%H:%M:%fZ', createdAt/1000.0, 'unixepoch') WHERE typeof(createdAt) IN ('integer', 'real');
UPDATE users SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', updatedAt/1000.0, 'unixepoch') WHERE typeof(updatedAt) IN ('integer', 'real');

UPDATE print_jobs SET createdAt = strftime('%Y-%m-%dT%H:%M:%fZ', createdAt/1000.0, 'unixepoch') WHERE typeof(createdAt) IN ('integer', 'real');
UPDATE print_jobs SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', updatedAt/1000.0, 'unixepoch') WHERE typeof(updatedAt) IN ('integer', 'real');

UPDATE orders SET createdAt = strftime('%Y-%m-%dT%H:%M:%fZ', createdAt/1000.0, 'unixepoch') WHERE typeof(createdAt) IN ('integer', 'real');
UPDATE orders SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', updatedAt/1000.0, 'unixepoch') WHERE typeof(updatedAt) IN ('integer', 'real');

UPDATE order_tracking SET timestamp = strftime('%Y-%m-%dT%H:%M:%fZ', timestamp/1000.0, 'unixepoch') WHERE typeof(timestamp) IN ('integer', 'real');

UPDATE pricing_settings SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', updatedAt/1000.0, 'unixepoch') WHERE typeof(updatedAt) IN ('integer', 'real');

UPDATE high_scores SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', updatedAt/1000.0, 'unixepoch') WHERE typeof(updatedAt) IN ('integer', 'real');
