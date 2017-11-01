/**
 * @jest-environment ./src/__test__/JestEnvironmentWithImages
 */

import { LatLng, latLng } from 'leaflet';
import { isStreetViewSupportedAt } from '../has-street-view';

describe('Street view', () => {
  it('is not available in the middle of Atlantic', async () => {
    const promise = isStreetViewSupportedAt(latLng(0, 0));
    await expect(promise).resolves.toBeFalsy();
  });
  it('is available in Szczecin center', async () => {
    const promise = isStreetViewSupportedAt(latLng(53.4296143, 14.5445406));
    await expect(promise).resolves.toBeTruthy();
  });
});
