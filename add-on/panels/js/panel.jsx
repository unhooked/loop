/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.panel = _.extend(loop.panel || {}, (function(_, mozL10n) {
  "use strict";

  var sharedActions = loop.shared.actions;
  var sharedMixins = loop.shared.mixins;
  var sharedDesktopViews = loop.shared.desktopViews;
  var sharedViews = loop.shared.views;
  var panelModels = loop.panel.models;
  var Button = sharedViews.Button;

  // XXX This must be kept in sync with the number in MozLoopService.jsm.
  // We should expose that one through MozLoopAPI and kill this constant.
  var FTU_VERSION = 2;

  var GettingStartedView = React.createClass({
    mixins: [sharedMixins.WindowCloseMixin],

    propTypes: {
      displayRoomListContent: React.PropTypes.bool
    },

    getDefaultProps: function() {
      return { displayRoomListContent: false };
    },

    handleButtonClick: function() {
      loop.request("OpenGettingStartedTour");
      this.closeWindow();
    },

    renderGettingStartedButton: function() {
      if (this.props.displayRoomListContent) {
        return null;
      }

      return (
        <div className="fte-button-container">
          <Button additionalClass="fte-get-started-button"
                  caption={mozL10n.get("first_time_experience_button_label2")}
                  htmlId="fte-button"
                  onClick={this.handleButtonClick} />
        </div>
      );
    },

    render: function() {
      var fteClasses = classNames({
        "fte-get-started-content": true,
        "fte-get-started-content-borders": this.props.displayRoomListContent
      });

      return (
        <div className={fteClasses}>
          <div className="fte-title">
            <img className="fte-logo" src="shared/img/hello_logo.svg" />
            <div className="fte-subheader">
              {this.props.displayRoomListContent ?
                mozL10n.get("first_time_experience_subheading_button_above") :
                  mozL10n.get("first_time_experience_subheading2")}
            </div>
            {this.props.displayRoomListContent ?
              null : <hr className="fte-separator" />}
            <div className="fte-content">
              {this.props.displayRoomListContent ?
                mozL10n.get("first_time_experience_content2") :
                  mozL10n.get("first_time_experience_content")}
            </div>
            <img className="fte-hello-web-share" src="shared/img/hello-web-share.svg" />
          </div>
          {this.renderGettingStartedButton()}
        </div>
      );
    }
  });

  /**
   * Displays a view requesting the user to sign-in again.
   */
  var SignInRequestView = React.createClass({
    mixins: [sharedMixins.WindowCloseMixin],

    handleSignInClick: function(event) {
      event.preventDefault();
      loop.request("LoginToFxA", true);
      this.closeWindow();
    },

    handleGuestClick: function() {
      loop.request("LogoutFromFxA");
    },

    render: function() {
      var shortname = mozL10n.get("clientShortname2");
      var line1 = mozL10n.get("sign_in_again_title_line_one", {
        clientShortname2: shortname
      });
      var line2 = mozL10n.get("sign_in_again_title_line_two2", {
        clientShortname2: shortname
      });
      var useGuestString = mozL10n.get("sign_in_again_use_as_guest_button2", {
        clientSuperShortname: mozL10n.get("clientSuperShortname")
      });

      return (
        <div className="sign-in-request">
          <h1>{line1}</h1>
          <h2>{line2}</h2>
          <div>
            <button className="btn btn-info sign-in-request-button"
                    onClick={this.handleSignInClick}>
              {mozL10n.get("sign_in_again_button")}
            </button>
          </div>
          <a onClick={this.handleGuestClick}>
            {useGuestString}
          </a>
        </div>
      );
    }
  });

  var ToSView = React.createClass({
    mixins: [sharedMixins.WindowCloseMixin],

    getInitialState: function() {
      return {
        terms_of_use_url: loop.getStoredRequest(["GetLoopPref", "legal.ToS_url"]),
        privacy_notice_url: loop.getStoredRequest(["GetLoopPref", "legal.privacy_url"])
      };
    },

    handleLinkClick: function(event) {
      if (!event.target || !event.target.href) {
        return;
      }

      event.preventDefault();
      loop.request("OpenURL", event.target.href);
      this.closeWindow();
    },

    render: function() {
      var tosString =
        '<a href="' + this.state.terms_of_use_url + '" target="_blank">' +
        mozL10n.get("legal_text_tos") +
        "</a>";

      var privacyString =
        '<a href="' + this.state.privacy_notice_url + '" target="_blank">' +
        mozL10n.get("legal_text_privacy") +
        "</a>";

      var locale = mozL10n.language.code;
      var tosHTML = mozL10n.get("legal_text_and_links3", {
        "clientShortname": mozL10n.get("clientShortname2"),
        "terms_of_use": tosString,
        "privacy_notice": privacyString
      });

      return (
        <div className="powered-by-wrapper" id="powered-by-wrapper">
          <p className="powered-by" id="powered-by">
            {mozL10n.get("powered_by_beforeLogo")}
            <span className={locale} id="powered-by-logo" />
            {mozL10n.get("powered_by_afterLogo")}
          </p>
          <p className="terms-service"
             dangerouslySetInnerHTML={{ __html: tosHTML }}
             onClick={this.handleLinkClick} />
         </div>
      );
    }
  });

  /**
   * Panel settings (gear) menu entry.
   */
  var SettingsDropdownEntry = React.createClass({
    propTypes: {
      displayed: React.PropTypes.bool,
      extraCSSClass: React.PropTypes.string,
      label: React.PropTypes.string.isRequired,
      onClick: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
      return { displayed: true };
    },

    render: function() {
      var cx = classNames;

      if (!this.props.displayed) {
        return null;
      }

      var extraCSSClass = {
        "dropdown-menu-item": true
      };
      if (this.props.extraCSSClass) {
        extraCSSClass[this.props.extraCSSClass] = true;
      }

      return (
        <li className={cx(extraCSSClass)} onClick={this.props.onClick}>
          {this.props.label}
        </li>
      );
    }
  });

  /**
   * Panel settings (gear) menu.
   */
  var SettingsDropdown = React.createClass({
    mixins: [sharedMixins.DropdownMenuMixin(), sharedMixins.WindowCloseMixin],

    getInitialState: function() {
      return {
        signedIn: !!loop.getStoredRequest(["GetUserProfile"]),
        doNotDisturb: loop.getStoredRequest(["GetDoNotDisturb"])
      };
    },

    componentWillUpdate: function(nextProps, nextState) {
      if (nextState.showMenu !== this.state.showMenu) {
        loop.requestMulti(
          ["GetUserProfile"],
          ["GetDoNotDisturb"]
        ).then(function(results) {
          this.setState({
            signedIn: !!results[0],
            doNotDisturb: results[1]
          });
        }.bind(this));
      }
    },

    handleClickSettingsEntry: function() {
      // XXX to be implemented at the same time as unhiding the entry
    },

    handleClickAccountEntry: function() {
      loop.request("OpenFxASettings");
      this.closeWindow();
    },

    handleClickAuthEntry: function() {
      if (this.state.signedIn) {
        loop.request("LogoutFromFxA");
        // Close the menu but leave the panel open
        this.hideDropdownMenu();
      } else {
        loop.request("LoginToFxA");
        // Close the panel, the menu will be closed by on blur listener of DropdownMenuMixin
        this.closeWindow();
      }
    },

    handleHelpEntry: function(event) {
      event.preventDefault();
      loop.request("GetLoopPref", "support_url").then(function(helloSupportUrl) {
        loop.request("OpenURL", helloSupportUrl);
        this.closeWindow();
      }.bind(this));
    },

    handleToggleNotifications: function() {
      loop.request("GetDoNotDisturb").then(function(result) {
        loop.request("SetDoNotDisturb", !result);
      });
      this.hideDropdownMenu();
    },

    /**
     * Load on the browser the feedback url from prefs
     */
    handleSubmitFeedback: function(event) {
      event.preventDefault();
      loop.request("GetLoopPref", "feedback.manualFormURL").then(function(helloFeedbackUrl) {
        loop.request("OpenURL", helloFeedbackUrl);
        this.closeWindow();
      }.bind(this));
    },

    openGettingStartedTour: function() {
      loop.request("OpenGettingStartedTour");
      this.closeWindow();
    },

    render: function() {
      var cx = classNames;
      var accountEntryCSSClass = this.state.signedIn ? "entry-settings-signout" :
                                                       "entry-settings-signin";
      var notificationsLabel = this.state.doNotDisturb ? "settings_menu_item_turnnotificationson" :
                                                         "settings_menu_item_turnnotificationsoff";

      return (
        <div className="settings-menu dropdown">
          <button className="button-settings"
             onClick={this.toggleDropdownMenu}
             ref="menu-button"
             title={mozL10n.get("settings_menu_button_tooltip")} />
          <ul className={cx({ "dropdown-menu": true, hide: !this.state.showMenu })}>
            <SettingsDropdownEntry
                extraCSSClass="entry-settings-notifications entries-divider"
                label={mozL10n.get(notificationsLabel)}
                onClick={this.handleToggleNotifications} />
            <SettingsDropdownEntry
                displayed={this.state.signedIn}
                extraCSSClass="entry-settings-account"
                label={mozL10n.get("settings_menu_item_account")}
                onClick={this.handleClickAccountEntry} />
            <SettingsDropdownEntry displayed={false}
                                   label={mozL10n.get("settings_menu_item_settings")}
                                   onClick={this.handleClickSettingsEntry} />
            <SettingsDropdownEntry label={mozL10n.get("tour_label")}
                                   onClick={this.openGettingStartedTour} />
            <SettingsDropdownEntry extraCSSClass="entry-settings-feedback"
                                   label={mozL10n.get("settings_menu_item_feedback")}
                                   onClick={this.handleSubmitFeedback} />
            <SettingsDropdownEntry extraCSSClass={accountEntryCSSClass}
                                   label={this.state.signedIn ?
                                          mozL10n.get("settings_menu_item_signout") :
                                          mozL10n.get("settings_menu_item_signin")}
                                   onClick={this.handleClickAuthEntry} />
            <SettingsDropdownEntry extraCSSClass="entry-settings-help"
                                   label={mozL10n.get("help_label")}
                                   onClick={this.handleHelpEntry} />
          </ul>
        </div>
      );
    }
  });

  /**
   * FxA sign in/up link component.
   */
  var AccountLink = React.createClass({
    mixins: [sharedMixins.WindowCloseMixin],

    propTypes: {
      userProfile: userProfileValidator
    },

    handleSignInLinkClick: function() {
      loop.request("LoginToFxA");
      this.closeWindow();
    },

    render: function() {
      if (this.props.userProfile && this.props.userProfile.email) {
        return (
          <div className="user-identity">
            {this.props.userProfile.email}
          </div>
        );
      }

      return (
        <p className="signin-link">
          <a href="#" onClick={this.handleSignInLinkClick}>
            {mozL10n.get("panel_footer_signin_or_signup_link")}
          </a>
        </p>
      );
    }
  });

  var RoomEntryContextItem = React.createClass({
    mixins: [loop.shared.mixins.WindowCloseMixin],

    propTypes: {
      roomUrls: React.PropTypes.array
    },

    handleClick: function(event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.currentTarget.href) {
        loop.request("OpenURL", event.currentTarget.href);
        this.closeWindow();
      }
    },

    _renderDefaultIcon: function() {
      return (
        <div className="room-entry-context-item">
          <img src="shared/img/icons-16x16.svg#globe" />
        </div>
      );
    },

    _renderIcon: function(roomUrl) {
      return (
        <div className="room-entry-context-item">
          <a href={roomUrl.location}
            onClick={this.handleClick}
            title={roomUrl.description}>
            <img src={roomUrl.thumbnail || "shared/img/icons-16x16.svg#globe"} />
          </a>
        </div>
      );
    },

    render: function() {
      var roomUrl = this.props.roomUrls && this.props.roomUrls[0];
      if (roomUrl && roomUrl.location) {
        return this._renderIcon(roomUrl);
      }

      return this._renderDefaultIcon();
    }
  });

  /**
   *  Aux function to retrieve the name of a room
   */
  function _getRoomTitle(room) {
    if (!room) {
      return mozL10n.get("room_name_untitled_page");
    }

    var urlData = (room.decryptedContext.urls || [])[0] || {};
    return room.decryptedContext.roomName ||
           urlData.description ||
           urlData.location ||
           mozL10n.get("room_name_untitled_page");
  }

  /**
   * Room list entry.
   *
   * Active Room means there are participants in the room.
   * Opened Room means the user is in the room.
   */
  var RoomEntry = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      isOpenedRoom: React.PropTypes.bool.isRequired,
      room: React.PropTypes.instanceOf(loop.store.Room).isRequired
    },

    mixins: [
      loop.shared.mixins.WindowCloseMixin,
      sharedMixins.DropdownMenuMixin()
    ],

    getInitialState: function() {
      return {
        editMode: false,
        eventPosY: 0,
        newRoomName: _getRoomTitle(this.props.room)
      };
    },

    _isActive: function() {
      return this.props.room.participants.length > 0;
    },

    componentDidUpdate: function() {
      if (this.state.editMode) {
        ReactDOM.findDOMNode(this).querySelector(".edit-room-input").focus();
      }
    },

    handleClickEntry: function(event) {
      event.preventDefault();

      if (this.state.editMode) {
        return;
      }

      // Open url if needed.
      loop.requestMulti(
        ["getSelectedTabMetadata"],
        ["GettingStartedURL", null, {}]
      ).then(function(results) {
        var contextURL = this.props.room.decryptedContext.urls &&
                         this.props.room.decryptedContext.urls[0].location;

        contextURL = contextURL || (results[1] + "?noopenpanel=1");

        if (results[0].url !== contextURL) {
          loop.request("OpenURL", contextURL);
        }
        this.closeWindow();

        // open the room after the (possible) tab change to be able to
        // share when opening from non-remote tab.
        this.props.dispatcher.dispatch(new sharedActions.OpenRoom({
          roomToken: this.props.room.roomToken
        }));
      }.bind(this));
    },

    handleClick: function(e) {
      e.preventDefault();
      e.stopPropagation();

      this.setState({
        eventPosY: e.pageY
      });

      this.toggleDropdownMenu();
    },

    handleEditButtonClick: function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Enter Edit mode
      this.setState({ editMode: true });
      this.toggleDropdownMenu();
    },

    /**
     * Handles a key being pressed - looking for the return key for saving
     * the new room name.
     */
    handleKeyDown: function(event) {
      if (event.which === 13) {
        this.exitEditMode();
      }
    },

    exitEditMode: function() {
      this.props.dispatcher.dispatch(
        new sharedActions.UpdateRoomContext({
          roomToken: this.props.room.roomToken,
          newRoomName: this.state.newRoomName
        })
      );
      this.setState({ editMode: false });
    },

    handleEditInputChange: function(event) {
      this.setState({ newRoomName: event.target.value });
    },

    /**
     * Callback called when moving cursor away from the conversation entry.
     * Will close the dropdown menu.
     */
    _handleMouseOut: function() {
      if (this.state.showMenu) {
        this.toggleDropdownMenu();
      }
    },

    render: function() {
      var roomClasses = classNames({
        "room-entry": true,
        "room-active": this._isActive(),
        "room-opened": this.props.isOpenedRoom
      });
      var roomTitle = _getRoomTitle(this.props.room);

      return (
        <div className={roomClasses}
          onClick={this.props.isOpenedRoom ? null : this.handleClickEntry}
          onMouseLeave={this.props.isOpenedRoom ? null : this._handleMouseOut}
          ref="roomEntry">
          <RoomEntryContextItem
            roomUrls={this.props.room.decryptedContext.urls} />
          {!this.state.editMode ?
            <h2>{roomTitle}</h2> :
            <input
              className="edit-room-input"
              onBlur={this.exitEditMode}
              onChange={this.handleEditInputChange}
              onKeyDown={this.handleKeyDown}
              type="text"
              value={this.state.newRoomName} />}
          {this.props.isOpenedRoom || this.state.editMode ? null :
            <RoomEntryContextButtons
              dispatcher={this.props.dispatcher}
              eventPosY={this.state.eventPosY}
              handleClick={this.handleClick}
              handleEditButtonClick={this.handleEditButtonClick}
              ref="contextActions"
              room={this.props.room}
              showMenu={this.state.showMenu}
              toggleDropdownMenu={this.toggleDropdownMenu} />}
        </div>
      );
    }
  });

  /**
   * Buttons corresponding to each conversation entry.
   * This component renders the edit button for displaying contextual dropdown
   * menu for conversation entries. It also holds the dropdown menu.
   */
  var RoomEntryContextButtons = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.object.isRequired,
      eventPosY: React.PropTypes.number.isRequired,
      handleClick: React.PropTypes.func.isRequired,
      handleEditButtonClick: React.PropTypes.func.isRequired,
      room: React.PropTypes.object.isRequired,
      showMenu: React.PropTypes.bool.isRequired,
      toggleDropdownMenu: React.PropTypes.func.isRequired
    },

    handleEmailButtonClick: function(event) {
      event.preventDefault();
      event.stopPropagation();

      this.props.dispatcher.dispatch(
        new sharedActions.EmailRoomUrl({
          roomUrl: this.props.room.roomUrl,
          from: "panel"
        })
      );

      this.props.toggleDropdownMenu();
    },

    handleCopyButtonClick: function(event) {
      event.stopPropagation();
      event.preventDefault();

      this.props.dispatcher.dispatch(new sharedActions.CopyRoomUrl({
        roomUrl: this.props.room.roomUrl,
        from: "panel"
      }));

      this.props.toggleDropdownMenu();
    },

    handleDeleteButtonClick: function(event) {
      event.stopPropagation();
      event.preventDefault();

      this.props.dispatcher.dispatch(new sharedActions.DeleteRoom({
        roomToken: this.props.room.roomToken
      }));

      this.props.toggleDropdownMenu();
    },

    render: function() {
      return (
        <div className="room-entry-context-actions">
          <div
            className="room-entry-context-edit-btn dropdown-menu-button"
            onClick={this.props.handleClick}
            ref="menu-button" />
          {this.props.showMenu ?
            <ConversationDropdown
              eventPosY={this.props.eventPosY}
              handleCopyButtonClick={this.handleCopyButtonClick}
              handleDeleteButtonClick={this.handleDeleteButtonClick}
              handleEditButtonClick={this.props.handleEditButtonClick}
              handleEmailButtonClick={this.handleEmailButtonClick}
              ref="menu" /> :
            null}
        </div>
      );
    }
  });

  /**
   * Compute Adjusted Top Position for Menu Dropdown
   * Extracted from react component so we could run unit test against it
   * takes clickYPos, menuNodeHeight, listTop, listHeight, clickOffset
   * parameters, determines whether menu should be above or below click
   * position and calculates where the top of the dropdown menu
   * should reside. If less than 0, which will result in the top of the dropdown
   * being cutoff, will set top position to 0
   */
  function computeAdjustedTopPosition(clickYPos, menuNodeHeight, listTop,
                                      listHeight, clickOffset) {
    var topPos = 0;

    if (clickYPos + menuNodeHeight >= listTop + listHeight) {
      // Position above click area.
      topPos = clickYPos - menuNodeHeight - listTop - clickOffset;
    } else {
      // Position below click area.
      topPos = clickYPos - listTop + clickOffset;
    }
    // Ensure menu is not cut off at top
    if (topPos < 0) {
      topPos = 0;
    }

    return topPos;
  }

  /**
   * Dropdown menu for each conversation entry.
   * Because the container element has overflow we need to position the menu
   * absolutely and have a different element as offset parent for it. We need
   * eventPosY to make sure the position on the Y Axis is correct while for the
   * X axis there can be only 2 different positions based on being RTL or not.
   */
  var ConversationDropdown = React.createClass({
    propTypes: {
      eventPosY: React.PropTypes.number.isRequired,
      handleCopyButtonClick: React.PropTypes.func.isRequired,
      handleDeleteButtonClick: React.PropTypes.func.isRequired,
      handleEditButtonClick: React.PropTypes.func.isRequired,
      handleEmailButtonClick: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      return {
        openDirUp: false
      };
    },

    componentDidMount: function() {
      var menuNode = ReactDOM.findDOMNode(this);

      var menuNodeRect = menuNode.getBoundingClientRect();

      // Get the parent element and make sure the menu does not overlow its
      // container.
      var listNode = loop.shared.utils.findParentNode(ReactDOM.findDOMNode(this),
                                                      "rooms");
      var listNodeRect = listNode.getBoundingClientRect();

      // Click offset to not display the menu right next to the area clicked.
      var topPos = computeAdjustedTopPosition(this.props.eventPosY,
        menuNodeRect.height, listNodeRect.top, listNodeRect.height, 10);

      menuNode.style.top = topPos + "px";
    },

    render: function() {
      var dropdownClasses = classNames({
        "dropdown-menu": true,
        "dropdown-menu-up": this.state.openDirUp
      });

      return (
        <ul className={dropdownClasses}>
          <li
            className="dropdown-menu-item"
            onClick={this.props.handleCopyButtonClick}
            ref="copyButton">
            {mozL10n.get("copy_link_menuitem")}
          </li>
          <li
            className="dropdown-menu-item"
            onClick={this.props.handleEmailButtonClick}
            ref="emailButton">
            {mozL10n.get("email_link_menuitem")}
          </li>
          <li
            className="dropdown-menu-item"
            onClick={this.props.handleEditButtonClick}
            ref="editButton">
            {mozL10n.get("edit_name_menuitem")}
          </li>
          <li
            className="dropdown-menu-item"
            onClick={this.props.handleDeleteButtonClick}
            ref="deleteButton">
            {mozL10n.get("delete_conversation_menuitem2")}
          </li>
        </ul>
      );
    }
  });

  /**
   * User profile prop can be either an object or null as per mozLoopAPI
   * and there is no way to express this with React 0.13.3
   */
  function userProfileValidator(props, propName, componentName) {
    if (Object.prototype.toString.call(props[propName]) !== "[object Object]" &&
        !_.isNull(props[propName])) {
      return new Error("Required prop `" + propName +
        "` was not correctly specified in `" + componentName + "`.");
    }
    return null;
  }

  /**
   * Room list.
   */
  var RoomList = React.createClass({
    mixins: [Backbone.Events, sharedMixins.WindowCloseMixin],

    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      store: React.PropTypes.instanceOf(loop.store.RoomStore).isRequired
    },

    getInitialState: function() {
      return this.props.store.getStoreState();
    },

    componentDidMount: function() {
      this.listenTo(this.props.store, "change", this._onStoreStateChanged);

      // XXX this should no longer be necessary once have a better mechanism
      // for updating the list (possibly as part of the content side of bug
      // 1074665.
      this.props.dispatcher.dispatch(new sharedActions.GetAllRooms());
    },

    componentWillUnmount: function() {
      this.stopListening(this.props.store);
    },

    _onStoreStateChanged: function() {
      this.setState(this.props.store.getStoreState());
    },

    /**
     * Let the user know we're loading rooms
     * @returns {Object} React render
     */
    _renderLoadingRoomsView: function() {
      /* XXX should refactor and separate "rooms" amd perhaps room-list so that
      we arent duplicating those elements all over */
      return (
        <div className="rooms">
          {this._renderNewRoomButton()}
          <div className="room-list">
            <div className="room-list-loading">
              <img src="shared/img/animated-spinner.svg" />
            </div>
          </div>
        </div>
      );
    },

    _renderNewRoomButton: function() {
      return (
        <NewRoomView dispatcher={this.props.dispatcher}
          inRoom={this.state.openedRoom !== null}
          pendingOperation={this.state.pendingCreation ||
                            this.state.pendingInitialRetrieval} />
      );
    },

    _addListGradientIfNeeded: function() {
      if (this.state.rooms.length > 5) {
        return (<div className="room-list-blur" />);
      }

      return null;
    },

    render: function() {
      var roomListClasses = classNames({
        "room-list": true,
        // add extra space to last item so when scrolling to bottom,
        // last item is not covered by the gradient
        "room-list-add-space": (this.state.rooms.length && this.state.rooms.length > 5),
        // Indicate there's a pending action to disable opening more rooms.
        "room-list-pending-creation": this.state.pendingCreation
      });

      if (this.state.error) {
        // XXX Better end user reporting of errors.
        console.error("RoomList error", this.state.error);
      }

      if (this.state.pendingInitialRetrieval) {
        return this._renderLoadingRoomsView();
      }

      return (
        <div className="rooms">
          {this._renderNewRoomButton()}
          {!this.state.rooms.length ? null :
            <h1>{mozL10n.get(this.state.openedRoom === null ?
              "rooms_list_recently_browsed2" :
              "rooms_list_currently_browsing2")}</h1>
          }
          {!this.state.rooms.length ?
            <GettingStartedView displayRoomListContent={true} /> :
            <div className={roomListClasses}>{
              this.state.rooms.map(function(room) {
                if (this.state.openedRoom !== null &&
                    room.roomToken !== this.state.openedRoom) {
                  return null;
                }

                return (
                  <RoomEntry
                    dispatcher={this.props.dispatcher}
                    isOpenedRoom={room.roomToken === this.state.openedRoom}
                    key={room.roomToken}
                    room={room} />
                );
              }, this)
            }
            </div>
          }
          {this._addListGradientIfNeeded()}
        </div>
      );
    }
  });

  /**
   * Used for creating a new room with or without context.
   */
  var NewRoomView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      inRoom: React.PropTypes.bool.isRequired,
      pendingOperation: React.PropTypes.bool.isRequired
    },

    mixins: [
      sharedMixins.DocumentVisibilityMixin,
      React.addons.PureRenderMixin
    ],

    getInitialState: function() {
      return {
        previewImage: "",
        description: "",
        url: ""
      };
    },

    onDocumentVisible: function() {
      // We would use onDocumentHidden to null out the data ready for the next
      // opening. However, this seems to cause an awkward glitch in the display
      // when opening the panel, and it seems cleaner just to update the data
      // even if there's a small delay.

      loop.request("GetSelectedTabMetadata").then(function(metadata) {
        // Bail out when the component is not mounted (anymore).
        // This occurs during test runs. See bug 1174611 for more info.
        if (!this.isMounted() || !metadata) {
          return;
        }

        var previewImage = metadata.favicon || "";
        var description = metadata.title || metadata.description;
        var url = metadata.url;
        this.setState({
          previewImage: previewImage,
          description: description,
          url: url
        });
      }.bind(this));
    },

    handleCreateButtonClick: function() {
      // check that tab is remote, open about:home if not
      loop.request("IsTabShareable").then(shareable => {
        if (!shareable) {
          loop.request("OpenURL", "about:home");
        }
      });

      var createRoomAction = new sharedActions.CreateRoom();
      createRoomAction.urls = [{
        location: this.state.url,
        description: this.state.description,
        thumbnail: this.state.previewImage
      }];
      this.props.dispatcher.dispatch(createRoomAction);
    },

    handleStopSharingButtonClick: function() {
      loop.request("HangupAllChatWindows");
    },

    render: function() {
      return (
        <div className="new-room-view">
          {this.props.inRoom ?
            <button className="btn btn-info stop-sharing-button"
              disabled={this.props.pendingOperation}
              onClick={this.handleStopSharingButtonClick}>
              {mozL10n.get("panel_disconnect_button")}
            </button> :
            <button className="btn btn-info new-room-button"
              disabled={this.props.pendingOperation}
              onClick={this.handleCreateButtonClick}>
              {mozL10n.get("panel_browse_with_friend_button")}
            </button>}
        </div>
      );
    }
  });

  /**
   * E10s not supported view
   */
  var E10sNotSupported = React.createClass({
    propTypes: {
      onClick: React.PropTypes.func.isRequired
    },
    componentWillMount: function() {
      loop.request("SetPanelHeight", 262);
    },

    render: function() {
      return (
        <div className="error-content">
          <header className="error-title">
            <img src="shared/img/sad_hello_icon_64x64.svg" />
            <p className="error-subheader">
              {mozL10n.get("e10s_not_supported_subheading", {
                brandShortname: mozL10n.get("clientShortname2")
              })}
            </p>
          </header>
          <Button additionalClass="e10s-not-supported-button"
                  caption={mozL10n.get("e10s_not_supported_button_label")}
                  onClick={this.props.onClick} />
        </div>
      );
    }
  });

  var SharePanelView = React.createClass({
    statics: {
      SHOW_PANEL_DELAY: 300
    },

    mixins: [
      Backbone.Events,
      sharedMixins.DocumentVisibilityMixin,
      sharedMixins.WindowCloseMixin
    ],

    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      // Force render for testing purpose
      forceRender: React.PropTypes.bool,
      onSharePanelDisplayChange: React.PropTypes.func.isRequired,
      store: React.PropTypes.instanceOf(loop.store.RoomStore).isRequired
    },

    getInitialState: function() {
      return this.props.store.getStoreState();
    },

    componentWillMount: function() {
      loop.request("GetLoopPref", "facebook.enabled").then(result => {
        this.setState({
          facebookEnabled: result
        });
      });
    },

    componentDidMount: function() {
      this.listenTo(this.props.store, "change", this._onStoreStateChanged);
    },

    componentDidUpdate: function() {
      if (this.state.showPanel) {
        setTimeout(() => {
          ReactDOM.findDOMNode(this).classList.add("share-panel-open");
        }, this.constructor.SHOW_PANEL_DELAY);
      }
    },

    componentWillUnmount: function() {
      this.stopListening(this.props.store);
    },

    _onStoreStateChanged: function() {
      this.setState(this.props.store.getStoreState());
    },

    onDocumentHidden: function() {
      this.state.showPanel && this.handleClosePanel();
    },

    componentWillUpdate: function(nextProps, nextState) {
      // If we've just created a room, open the panel
      if (this.state.pendingCreation &&
          !nextState.pendingCreation && !nextState.error) {
        this.props.onSharePanelDisplayChange();
        this.setState({
          showPanel: true
        });
      }
    },

    handleClosePanel: function() {
      this.props.onSharePanelDisplayChange();
      this.openRoom();
      this.closeWindow();

      this.setState({
        showPanel: false
      });
    },

    openRoom: function() {
      var activeRoom = this.state.activeRoom;
      this.props.dispatcher.dispatch(new sharedActions.OpenRoom({
        roomToken: activeRoom.roomToken
      }));
    },

    render: function() {
      if (!this.state.showPanel && !this.props.forceRender) {
        return null;
      }

      var sharePanelClasses = classNames({
        "share-panel-container": true,
        "share-panel-open": this.props.forceRender
      });
      var activeRoom = this.state.activeRoom;
      var roomData = {
        roomUrl: activeRoom.roomUrl,
        roomContextUrls: (activeRoom.decryptedContext && activeRoom.decryptedContext.urls) || []
      };

      return (
        <div className={sharePanelClasses}>
          <div className="share-panel-overlay" onClick={this.handleClosePanel} />
          <sharedDesktopViews.SharePanelView
            callback={this.handleClosePanel}
            dispatcher={this.props.dispatcher}
            error={this.state.error}
            facebookEnabled={this.state.facebookEnabled}
            locationForMetrics="panel"
            roomData={roomData}
            show={true} />
        </div>
      );
    }
  });

  var RenameRoomView = React.createClass({
    mixins: [sharedMixins.WindowCloseMixin],

    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      roomName: React.PropTypes.string.isRequired,
      roomToken: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
      return { focused: false };
    },

    componentDidMount: function() {
      ReactDOM.findDOMNode(this).querySelector("input").focus();
    },

    handleBlur: function() {
      this.setState({ focused: false });
    },

    handleFocus: function() {
      this.setState({ focused: true });
      ReactDOM.findDOMNode(this).querySelector("input").select();
    },

    handleKeyDown: function(event) {
      if (event.which === 13) {
        this.handleNameChange();
      }
    },

    handleNameChange: function() {
      let token = this.props.roomToken,
          name = ReactDOM.findDOMNode(this).querySelector("input").value || "";

      if (name !== this.props.roomName) {
        this.props.dispatcher.dispatch(
          new sharedActions.UpdateRoomContext({
            roomToken: token,
            newRoomName: name
          })
        );
      }

      this.closeWindow();
    },

    render: function() {
      let inputClass = classNames({
        "input-group": true,
        "focused": this.state.focused
      });

      return (
        <div className="rename-newRoom">
          <img src="shared/img/helloicon.svg" />
          <div className="rename-container">
            <h2 className="rename-header">
              {mozL10n.get("door_hanger_bye")}
            </h2>
            <p className="rename-subheader">
              {mozL10n.get("door_hanger_return2")}
            </p>
            <p className="rename-prompt">
              {mozL10n.get("door_hanger_current")}
            </p>
            <div className={inputClass}>
              <input className="rename-input"
                     defaultValue={this.props.roomName}
                     onBlur={this.handleBlur}
                     onFocus={this.handleFocus}
                     onKeyDown={this.handleKeyDown}
                     type="text" />
            </div>
          </div>
          <Button additionalClass="rename-button"
                  caption={mozL10n.get("door_hanger_button2")}
                  onClick={this.handleNameChange} />
        </div>
      );
    }
  });

  /**
   * Panel view.
   */
  var PanelView = React.createClass({
    mixins: [
     Backbone.Events,
     sharedMixins.DocumentVisibilityMixin
    ],

    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      // Only used for the ui-showcase:
      gettingStartedSeen: React.PropTypes.bool,
      notifications: React.PropTypes.object.isRequired,
      roomStore: React.PropTypes.instanceOf(loop.store.RoomStore).isRequired,
      // Only used for the ui-showcase:
      userProfile: React.PropTypes.object
    },

    getDefaultProps: function() {
      return {
        gettingStartedSeen: true
      };
    },

    getInitialState: function() {
      return {
        hasEncryptionKey: loop.getStoredRequest(["GetHasEncryptionKey"]),
        userProfile: loop.getStoredRequest(["GetUserProfile"]),
        gettingStartedSeen: loop.getStoredRequest(["GetLoopPref", "gettingStarted.latestFTUVersion"]) >= FTU_VERSION,
        multiProcessActive: loop.getStoredRequest(["IsMultiProcessActive"]),
        remoteAutoStart: loop.getStoredRequest(["GetLoopPref", "remote.autostart"]),
        renameRoom: null,
        sharePanelOpened: false
      };
    },

    _serviceErrorToShow: function() {
      return new Promise(function(resolve) {
        loop.request("GetErrors").then(function(errors) {
          if (!errors || !Object.keys(errors).length) {
            resolve(null);
            return;
          }
          // Just get the first error for now since more than one should be rare.
          var firstErrorKey = Object.keys(errors)[0];
          resolve({
            type: firstErrorKey,
            error: errors[firstErrorKey]
          });
        });
      });
    },

    updateServiceErrors: function() {
      this._serviceErrorToShow().then(function(serviceError) {
        if (serviceError) {
          this.props.notifications.set({
            id: "service-error",
            level: "error",
            message: serviceError.error.friendlyMessage,
            details: serviceError.error.friendlyDetails,
            detailsButtonLabel: serviceError.error.friendlyDetailsButtonLabel,
            detailsButtonCallback: serviceError.error.friendlyDetailsButtonCallback
          });
        } else {
          this.props.notifications.remove(this.props.notifications.get("service-error"));
        }
      }.bind(this));
    },

    _onStatusChanged: function() {
      loop.requestMulti(
        ["GetUserProfile"],
        ["GetHasEncryptionKey"],
        ["GetLoopPref", "gettingStarted.latestFTUVersion"]
      ).then(function(results) {
        var profile = results[0];
        var hasEncryptionKey = results[1];
        var prefFTUVersion = results[2];

        var stateToUpdate = {};

        // It's possible that this state change was slideshow related
        // so update that if the pref has changed.
        var prefGettingStartedSeen = (prefFTUVersion >= FTU_VERSION);
        if (prefGettingStartedSeen !== this.state.gettingStartedSeen) {
           stateToUpdate.gettingStartedSeen = prefGettingStartedSeen;
        }

        var currUid = this.state.userProfile ? this.state.userProfile.uid : null;
        var newUid = profile ? profile.uid : null;
        if (currUid === newUid) {
          // Update the state of hasEncryptionKey as this might have changed now.
          stateToUpdate.hasEncryptionKey = hasEncryptionKey;
        } else {
          stateToUpdate.userProfile = profile;
        }

        this.setState(stateToUpdate);

        this.updateServiceErrors();
      }.bind(this));
    },

    _onClosingNewRoom: function() {
      // If we close a recently created room, we offer the chance of renaming it
      let storeState = this.props.roomStore.getStoreState();
      if (!storeState.closingNewRoom || !storeState.openedRoom) {
        return;
      }

      let closedRoom = storeState.rooms.filter(function(room) {
        // closing room is the last that was opened.
        return storeState.openedRoom === room.roomToken;
      })[0];

      this.setState({
        renameRoom: storeState.closingNewRoom &&
          {
            token: storeState.openedRoom,
            name: _getRoomTitle(closedRoom)
          }
      });
    },

    onDocumentHidden: function() {
      // consider closing panel any other way than click OK button
      // or Enter key the same as cancel renaming the room
      this.setState({ renameRoom: null });
    },

    componentWillMount: function() {
      this.updateServiceErrors();
      this.listenTo(this.props.roomStore, "change:closingNewRoom",
                    this._onClosingNewRoom);
    },

    componentDidMount: function() {
      loop.subscribe("LoopStatusChanged", this._onStatusChanged);
    },

    componentWillUnmount: function() {
      loop.unsubscribe("LoopStatusChanged", this._onStatusChanged);
      this.stopListening(this.props.roomStore);
    },

    handleContextMenu: function(e) {
      e.preventDefault();
    },

    launchNonE10sWindow: function() {
      loop.request("GetSelectedTabMetadata").then(function(metadata) {
        loop.request("OpenNonE10sWindow", metadata.url);
      });
    },

    toggleSharePanelState: function() {
      this.setState({
        sharePanelOpened: !this.state.sharePanelOpened
      });
    },

    render: function() {
      if (this.state.multiProcessActive && !this.state.remoteAutoStart) {
        return (
          <E10sNotSupported onClick={this.launchNonE10sWindow} />
        );
      }

      if (!this.props.gettingStartedSeen || !this.state.gettingStartedSeen) {
        return (
          <div className="fte-get-started-container"
               onContextMenu={this.handleContextMenu}>
            <NotificationListView
              clearOnDocumentHidden={true}
              notifications={this.props.notifications} />
            <GettingStartedView />
            <ToSView />
          </div>
        );
      }

      if (!this.state.hasEncryptionKey) {
        return <SignInRequestView />;
      }

      if (this.state.renameRoom) {
        return (
          <RenameRoomView
            dispatcher={this.props.dispatcher}
            roomName={this.state.renameRoom.name}
            roomToken={this.state.renameRoom.token} />
        );
      }

      var cssClasses = classNames({
        "panel-content": true,
        "showing-share-panel": this.state.sharePanelOpened
      });

      return (
        <div className={cssClasses}
             onContextMenu={this.handleContextMenu} >
          <div className="beta-ribbon" />
          <NotificationListView
            clearOnDocumentHidden={true}
            notifications={this.props.notifications} />
          <div className="panel-container">
            <RoomList dispatcher={this.props.dispatcher}
              store={this.props.roomStore} />
            <div className="footer">
                <AccountLink userProfile={this.props.userProfile || this.state.userProfile} />
              <div className="signin-details">
                <SettingsDropdown />
              </div>
            </div>
            <SharePanelView
              dispatcher={this.props.dispatcher}
              onSharePanelDisplayChange={this.toggleSharePanelState}
              store={this.props.roomStore} />
          </div>
        </div>
      );
    }
  });

  /**
   * Notification view.
   */
  var NotificationView = React.createClass({
    mixins: [Backbone.Events],

    propTypes: {
      notification: React.PropTypes.object.isRequired
    },

    render: function() {
      var notification = this.props.notification;
      return (
        <div className="notificationContainer">
          <div className={"alert alert-" + notification.get("level")}>
            <span className="message">{notification.get("message")}</span>
          </div>
          <div className={"detailsBar details-" + notification.get("level")}
               hidden={!notification.get("details")}>
            <button className="detailsButton btn-info"
                    hidden={!notification.get("detailsButtonLabel") || !notification.get("detailsButtonCallback")}
                    onClick={notification.get("detailsButtonCallback")}>
              {notification.get("detailsButtonLabel")}
            </button>
            <span className="details">{notification.get("details")}</span>
          </div>
        </div>
      );
    }
  });

  /**
   * Notification list view.
   */
  var NotificationListView = React.createClass({
    mixins: [Backbone.Events, sharedMixins.DocumentVisibilityMixin],

    propTypes: {
      clearOnDocumentHidden: React.PropTypes.bool,
      notifications: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
      return { clearOnDocumentHidden: false };
    },

    componentDidMount: function() {
      this.listenTo(this.props.notifications, "reset add remove", function() {
        this.forceUpdate();
      });
    },

    componentWillUnmount: function() {
      this.stopListening(this.props.notifications);
    },

    /**
     * Provided by DocumentVisibilityMixin. Clears notifications stack when the
     * current document is hidden if the clearOnDocumentHidden prop is set to
     * true and the collection isn't empty.
     */
    onDocumentHidden: function() {
      if (this.props.clearOnDocumentHidden &&
          this.props.notifications.length > 0) {
        // Note: The `silent` option prevents the `reset` event to be triggered
        // here, preventing the UI to "jump" a little because of the event
        // callback being processed in another tick (I think).
        this.props.notifications.reset([], { silent: true });
        this.forceUpdate();
      }
    },

    render: function() {
      return (
        <div className="messages">
          {this.props.notifications.map(function(notification, key) {
            return <NotificationView key={key} notification={notification} />;
          })}
        </div>
      );
    }
  });

  /**
   * Panel initialisation.
   */
  function init() {
    var requests = [
      ["GetAllConstants"],
      ["GetAllStrings"],
      ["GetLocale"],
      ["GetPluralRule"]
    ];
    var prefetch = [
      ["GetLoopPref", "gettingStarted.latestFTUVersion"],
      ["GetLoopPref", "legal.ToS_url"],
      ["GetLoopPref", "legal.privacy_url"],
      ["GetLoopPref", "remote.autostart"],
      ["GetUserProfile"],
      ["GetDoNotDisturb"],
      ["GetHasEncryptionKey"],
      ["IsMultiProcessActive"]
    ];

    return loop.requestMulti.apply(null, requests.concat(prefetch))
      .then(function(results) {
      // `requestIdx` is keyed off the order of the `requests` and `prefetch`
      // arrays. Be careful to update both when making changes.
      var requestIdx = 0;
      var constants = results[requestIdx];
      // Do the initial L10n setup, we do this before anything
      // else to ensure the L10n environment is setup correctly.
      var stringBundle = results[++requestIdx];
      var locale = results[++requestIdx];
      var pluralRule = results[++requestIdx];
      mozL10n.initialize({
        locale: locale,
        pluralRule: pluralRule,
        getStrings: function(key) {
          if (!(key in stringBundle)) {
            console.error("No string found for key: ", key);
            return "{ textContent: '' }";
          }

          return JSON.stringify({ textContent: stringBundle[key] });
        }
      });

      prefetch.forEach(function(req) {
        req.shift();
        loop.storeRequest(req, results[++requestIdx]);
      });

      var notifications = new panelModels.NotificationCollection();
      var dispatcher = new loop.Dispatcher();
      var roomStore = new loop.store.RoomStore(dispatcher, {
        notifications: notifications,
        constants: constants
      });

      ReactDOM.render(<PanelView
        dispatcher={dispatcher}
        notifications={notifications}
        roomStore={roomStore} />, document.querySelector("#main"));

      document.documentElement.setAttribute("lang", mozL10n.language.code);
      document.documentElement.setAttribute("dir", mozL10n.language.direction);
      document.body.setAttribute("platform", loop.shared.utils.getPlatform());

      // Notify the window that we've finished initalization and initial layout
      var evtObject = document.createEvent("Event");
      evtObject.initEvent("loopPanelInitialized", true, false);
      window.dispatchEvent(evtObject);
    });
  }

  return {
    AccountLink: AccountLink,
    computeAdjustedTopPosition: computeAdjustedTopPosition,
    ConversationDropdown: ConversationDropdown,
    E10sNotSupported: E10sNotSupported,
    GettingStartedView: GettingStartedView,
    init: init,
    NewRoomView: NewRoomView,
    NotificationListView: NotificationListView,
    PanelView: PanelView,
    RenameRoomView: RenameRoomView,
    RoomEntry: RoomEntry,
    RoomEntryContextButtons: RoomEntryContextButtons,
    RoomList: RoomList,
    SettingsDropdown: SettingsDropdown,
    SharePanelView: SharePanelView,
    SignInRequestView: SignInRequestView,
    ToSView: ToSView
  };
})(_, document.mozL10n));

document.addEventListener("DOMContentLoaded", loop.panel.init);
