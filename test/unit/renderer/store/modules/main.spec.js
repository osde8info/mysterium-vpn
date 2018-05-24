/*
 * Copyright (C) 2017 The "MysteriumNetwork/mysterion" Authors.
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

import {expect} from 'chai'

import {mutations} from '@/store/modules/main'
import type from '@/store/types'

describe('mutations', () => {
  describe('SHOW_ERROR', () => {
    it('saves message and shows it with ordinary error', () => {
      const state = {}
      const err = new Error('My error')
      mutations[type.SHOW_ERROR](state, err)

      expect(state.showError).to.eql(true)
      expect(state.errorMessage).to.eql('My error')
    })

    it('saves message and shows it with response error', () => {
      const state = {}
      const err = new Error('My error')
      err.response = {
        data: {
          message: 'Response message'
        }
      }
      mutations[type.SHOW_ERROR](state, err)

      expect(state.showError).to.eql(true)
      expect(state.errorMessage).to.eql('Response message')
    })

    it('displays Unknown error if no error.message found', () => {
      const state = {}
      const err = new Error()
      mutations[type.SHOW_ERROR](state, err)
      expect(state.showError).to.eql(true)
      expect(state.errorMessage).to.eql('Unknown error')
    })
  })

  describe('SHOW_ERROR_MESSAGE', () => {
    it('saves message and shows it', () => {
      const state = {}
      mutations[type.SHOW_ERROR_MESSAGE](state, 'error message')

      expect(state.showError).to.eql(true)
      expect(state.errorMessage).to.eql('error message')
    })
  })

  describe('HIDE_ERROR', () => {
    it('hides error', () => {
      const state = {
        showError: true
      }
      mutations[type.HIDE_ERROR](state)

      expect(state.showError).to.eql(false)
    })
  })
})
