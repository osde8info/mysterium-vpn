<!--
  - Copyright (C) 2018 The "mysteriumnetwork/mysterium-vpn" Authors.
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
  <div
    class="app__nav nav nav--right"
    :class="{'is-open': isIdentityMenuOpen}">
    <div
      class="nav__content nav__content--right"
      :class="{'is-open': isIdentityMenuOpen}">

      <div class="nav__navicon">
        <close-button :click="hideInstructions"/>
      </div>

      <nav-list>
        <div
          class="identity-menu"
          slot="item">
          <h1>Mysterium ID</h1>

          <div
            class="flex-line"
            v-if="consumerId">
            <div class="flex-line__item">
              <logo-icon :active="registrationFetched"/>
            </div>
            <div
              class="flex-line__item identity-menu__text"
              :class="{'identity-menu__text--red': !registrationFetched}">
              {{ consumerId }}
            </div>
            <copy-button
              class="flex-line__item"
              :text="consumerId"/>
          </div>

          <h2>Ether address</h2>

          <div class="flex-line">
            <div
              class="flex-line__item">
              <img
                src="../../../static/icons/ethereum.png"
                class="icon-ethereum">
            </div>
            <input
              class="flex-line__item flex-line__item--autosize"
              type="text"
              v-if="changingEthAddress"
              v-model="inputEthAddress"
              placeholder="Enter Ether address to receive Bounty rewards">
            <div
              class="flex-line__item flex-line__item--autosize identity-menu__text"
              v-if="!changingEthAddress">
              {{ savedEthAddress }}
            </div>
          </div>

          <div
            v-if="changingEthAddress"
            class="btn"
            @click="saveEtherAddress()">
            OK
          </div>
          <div
            v-if="!changingEthAddress"
            class="btn"
            @click="changeEthAddress()">
            Change
          </div>

          <div
            v-if="paymentsAreEnabled && registrationFetched && !registration.registered">
            <p>
              In order to use Mysterium VPN you need to have registered ID in Mysterium Blockchain
              by staking your MYST tokens on it (i.e. paying for it).
            </p>
            <p>
              To pay for the ID we suggest to use MetaMask wallet.
              Please follow below instructions to proceed further:
            </p>
            <ul>
              <li>1. Click on the “Register Your ID” button</li>
              <li>2. Claim MYST and ETH test tokens</li>
              <li>3. Allow Mysterium SmartContract to reserve MYST tokens</li>
              <li>4. Register your ID by clicking on “Pay & Register For ID”</li>
              <li>5. Wait for few minutes until the payment is processed</li>
            </ul>
            <div
              class="btn"
              @click="openPaymentsUrl()">
              Register Your ID
            </div>
          </div>
        </div>
      </nav-list>
    </div>
    <transition name="fade">
      <div
        v-if="isIdentityMenuOpen"
        class="nav__backdrop nav__backdrop--right"
        @click="hideInstructions"/>
    </transition>
  </div>
</template>

<script>

import CloseButton from './close-button'
import CopyButton from './copy-button'
import NavList from './nav-list'
import types from '../store/types'
import { shell, clipboard } from 'electron'
import { mapGetters } from 'vuex'
import LogoIcon from './logo-icon'

export default {
  name: 'IdentityRegistration',
  dependencies: [
    'rendererCommunication',
    'getPaymentLink',
    'featureToggle',
    'tequilapiClient',
    'identityManager',
    'bugReporter'
  ],
  components: {
    CloseButton,
    CopyButton,
    LogoIcon,
    NavList
  },
  data () {
    return {
      inputEthAddress: '',
      savedEthAddress: null,
      changingEthAddress: true
    }
  },
  async created () {
    try {
      this.savedEthAddress = await this.identityManager.fetchEthAddress()
    } catch (err) {
      if (!err.isTequilapiError) {
        this.bugReporter.captureErrorException(err)
      }
    }
    if (this.savedEthAddress) {
      this.changingEthAddress = false
    }
  },
  methods: {
    hideInstructions () {
      this.$store.commit(types.HIDE_IDENTITY_MENU)
    },
    openPaymentsUrl () {
      if (!this.registration.publicKey || !this.registration.signature) {
        throw Error('Not all required registration fields are present')
      }
      const url = this.getPaymentLink(this.registration.publicKey, this.registration.signature)
      shell.openExternal(url)
    },
    copyId () {
      clipboard.writeText(this.consumerId)
    },
    async changeEthAddress () {
      this.inputEthAddress = this.savedEthAddress
      this.changingEthAddress = true
    },
    async saveEtherAddress () {
      const identity = this.identityManager.currentIdentity
      if (!identity) {
        throw new Error('Current identity is missing, cannot update identity payout')
      }
      await this.tequilapiClient.updateIdentityPayout(identity.id, this.inputEthAddress)
      this.savedEthAddress = this.inputEthAddress
      this.changingEthAddress = false
    }
  },
  computed: {
    registrationFetched () {
      return this.registration != null
    },
    isIdentityMenuOpen () {
      return this.$store.state.main.identityMenuOpen
    },
    paymentsAreEnabled () {
      return this.featureToggle.paymentsAreEnabled()
    },
    ...mapGetters({
      consumerId: 'currentIdentity',
      registration: 'registration'
    })
  }
}
</script>
