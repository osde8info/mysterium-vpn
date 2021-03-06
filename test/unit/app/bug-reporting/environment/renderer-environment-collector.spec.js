/*
 * Copyright (C) 2017 The "mysteriumnetwork/mysterium-vpn" Authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow

import { beforeEach, describe, expect, it } from '../../../../helpers/dependencies'
import RendererEnvironmentCollector
  from '../../../../../src/app/bug-reporting/environment/renderer-environment-collector'
import FakeSyncRendererCommunication from '../../../../helpers/communication/fake-sync-renderer-communication'
import BugReporterMetricsStore from '../../../../../src/app/bug-reporting/metrics/bug-reporter-metrics-store'
import type { BugReporterMetrics } from '../../../../../src/app/bug-reporting/metrics/bug-reporter-metrics'
import { TimeFormatter } from '../../../../../src/libraries/formatters/time-formatter'

describe('RendererEnvironmentCollector', () => {
  const releaseID = 'id of release'
  let communication: FakeSyncRendererCommunication
  let collector: RendererEnvironmentCollector
  let metrics: BugReporterMetrics

  beforeEach(() => {
    communication = new FakeSyncRendererCommunication()
    const timeFormatter = new TimeFormatter(0)
    metrics = new BugReporterMetricsStore(timeFormatter)
    collector = new RendererEnvironmentCollector(releaseID, communication, metrics)
  })

  describe('.getReleaseId', () => {
    it('returns release id', () => {
      expect(collector.getReleaseId()).to.eql(releaseID)
    })
  })

  describe('.getSerializedCaches', () => {
    it('returns logs using sync communication', () => {
      expect(collector.getSerializedCaches()).to.eql(communication.mockedSerializedCaches)
    })

    it('returns empty logs when communication returns null logs', () => {
      communication.mockedSerializedCaches = null

      expect(collector.getSerializedCaches()).to.eql({
        backend: { info: '', error: '' },
        frontend: { info: '', error: '' },
        mysterium_process: { info: '', error: '' }
      })
    })
  })

  describe('.getMetrics', () => {
    it('returns metrics from metrics storage', () => {
      expect(collector.getMetrics()).to.eql(metrics.getMetrics())
    })
  })
})
