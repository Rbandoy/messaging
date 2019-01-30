import { v1 as uuid } from 'uuid';
import crypto from 'crypto';

export default function() {
  const [, low, mid, high] = uuid().match(
    /^([0-9a-f]{8})-([0-9a-f]{4})-1([0-9a-f]{3})/
  ) as string[];

  return `evt_${high}${mid}${low}${crypto.randomBytes(4).toString('hex')}`;
}
