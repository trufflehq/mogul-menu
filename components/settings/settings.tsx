import React from 'react'
import { Component, Stream } from '@spore/platform'

export default function chromeExtSettings () {
  return (
    <div className="c-browser-extension-settings">
      <div className="settings-header">
        Settings
      </div>
      <div className="chat-identity section">
        <div className="header">
          Chat Identity
        </div>
        <div className="label">
          Username
        </div>
        <Component slug="input" />
      </div>
      <div className="emotes section">
        <div className="header">
          Emotes
        </div>
        <div className="switch-row">
          <div className="switch-label">
            Show global Twitch emotes
          </div>
          <Component
            slug="toggle"
            props={{
              // TODO: replace with actual stream
              valueStream: Stream.createSubject(false)
            }}
          />
        </div>
        <div className="switch-row">
          <div className="switch-label">
            Show BTTV emotes
          </div>
          <Component
            slug="toggle"
            props={{
              // TODO: replace with actual stream
              valueStream: Stream.createSubject(false)
            }}
          />
        </div>
        <div className="switch-row">
          <div className="switch-label">
            Show FFZ emotes
          </div>
          <Component
            slug="toggle"
            props={{
              // TODO: replace with actual stream
              valueStream: Stream.createSubject(false)
            }}
          />
        </div>
      </div>
      <div className="player section">
        <div className="header">
          Player
        </div>
        <div className="switch-row">
          <div className="switch-label">
            Custom theater mode
          </div>
          <Component
            slug="toggle"
            props={{
              // TODO: replace with actual stream
              valueStream: Stream.createSubject(false)
            }}
          />
        </div>
      </div>
      <div className="connections section">
        <div className="header">
          Connections
        </div>
        <Component slug="browser-extension-ways-to-earn" />
      </div>
    </div>
  )
}
