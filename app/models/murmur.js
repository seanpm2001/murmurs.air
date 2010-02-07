/*
 * Copyright 2009 ThoughtWorks, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

Murmur = function(id) {
  var attr_store = new MemAttributesStore()
  
  var mentions_user = function(index, user) {
    var tag_reg_exp = new RegExp('@' + user + '\\b', 'i')
    return (public.content().match(tag_reg_exp) != null)
  }
  
  var public = {
    'id': id,
    content: function(v) { return attr('content', v, attr_store) },
    created_at: function(v) { return attr('created_at', v, attr_store) },
    author: function(v) { return attr('author', v, attr_store) },
    jabber_user_name: function(v){ return attr('jabber_user_name', v, attr_store) },
    
    mentions_current_user: function() {
      if(!User.current()) { return false }
      return $.any(User.current().possible_mention_strings(), mentions_user)
    },
    
    blank: function() {
      return this.content() == null || this.content().blank()
    },
    
    remurmur:function() {
      return 'RM @' + this.display_name() + ': ' + this.content() + ' // '
    },
    
    reply:function(){
      return "@" + this.display_name() + " "
    },
    
    display_name: function(){
      return this.author() ? this.author().login : this.jabber_user_name()
    },
    
    from_current_user: function() {
      if(!User.current() || ! this.author()) { return false }
      return User.current().login()  == this.author().login
    }
  }
  
  return public
}

Murmur.id_asc_order = function(left, right) {
  if(left.id == right.id) { return 0 }
  return left.id > right.id ? 1 : -1
}

Murmur.id_desc_order = function(left, right) {
  if(left.id == right.id) { return 0 }
  return left.id < right.id ? 1 : -1
}

MurmurParser = function() {
  
  var not_nil = function(element) {
    return element.attr('nil') != 'true'
  }
  
  var public =  {
    parse_collection: function(xml) {
      return $("murmurs murmur", xml).map(function() {
        return public.parse(this)
      })
    },

    parse: function(xml) {
      var id = parseInt($("id", xml)[0].textContent)
      var murmur = new Murmur(id)
      
      murmur.content($("body", xml).text())
      murmur.created_at($("created_at", xml).text())
      
      if(not_nil($("jabber_user_name", xml))) {
        murmur.jabber_user_name($("jabber_user_name", xml).text())
      }
      
      if(not_nil($("author", xml))) {
        murmur.author({
         name: $("author name", xml).text(),
         icon_path: new Preference().host() + $("author icon_path", xml).text(),
         login: $("author login", xml).text()
        })        
      }
      
      return murmur
    }
  }
  
  return public
}()