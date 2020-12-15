/**
 * @jest-environment ./src/__test__/JestEnvironmentWithImages
 */

import { latLng } from 'leaflet';
import { isStreetViewSupportedAt } from '../has-street-view';
import {GOOGLE_API_KEY} from './private';

describe('Street view', () => {
  it('StreetView API has changed and is no longer working...', async () => {
    // dummy
  });
  // StreetView API has changed and is no longer working...
  // it('is not available in the middle of Atlantic', async () => {
  //   const promise = isStreetViewSupportedAt(latLng(0, 0), GOOGLE_API_KEY);
  //   await expect(promise).resolves.toBeFalsy();
  // });
  // it('is available in Szczecin center', async () => {
  //   const promise = isStreetViewSupportedAt(latLng(53.4296143, 14.5445406), GOOGLE_API_KEY);
  //   await expect(promise).resolves.toBeTruthy();
  // });
});
