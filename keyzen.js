var data = {};
var hits_correct = 0;
var hits_wrong = 0;
var start_time = 0;
var hpm = 0;
var ratio = 0;

layouts={};
layouts["colemak"] = " tnseriaodhplfuwyq;gjvmc,x.z/bk4738291056'\"!?:@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
layouts["colemak-dh"] = " tnseriaogmplfuwyq;bjvhd,c.x/zk4738291056'\"!?:@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
layouts["colemak-dhk"] = " tnseriaogkplfuwyq;bjvhd,c.x/zm4738291056'\"!?:@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
layouts["colemak-dh-matrix"] = " tnseriaogmplfuwyq;bjdhc,x.z/vk4738291056'\"!?:@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
layouts["colemak-dhk-matrix"] = " tnseriaogkplfuwyq;bjdhc,x.z/vm4738291056'\"!?:@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
layouts["qwerty"] = " fjdksla;ghrueiwoqptyvmc,x.z/bn4738291056`-=[]\\'ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
layouts["custom"] = " #=-*_`>![]()1234567890";

// layouts["azerty"] = " jfkdlsmqhgyturieozpabnvcxw6758493021`-=[]\\;',./ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
// layouts["b�po"] = " tesirunamc,�vodpl�jbk'.qxghyf�zw6758493021`-=[]\\;/ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
// layouts["norman"] = " ntieosaygjkufrdlw;qbpvmcxz1234567890'\",.!?:;/@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
// layouts["code-es6"] = " {}',;():.>=</_-|`!?#[]\\+\"@$%&*~^";

data.chars = layouts["colemak"];
data.consecutive = 5;
data.word_length = 7;
data.current_layout = "colemak";
data.custom_chars = '';
data.keyboard_color = true;

shift_keys = '~!@#$%^&*()_+{}|:"<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ';
other_keys = '1234567890`-=[]\\;\',./';

CUSTOM_LAYOUT = 'custom';

/**
 * Executes the provided function when the DOM is fully loaded and ready.
 */
$(document).ready(function() {
    // Check if there is data stored in the local storage
    if (localStorage.data != undefined) {
        load();
        // Check if the current layout is a custom layout and if custom characters are available
        if (data.current_layout == CUSTOM_LAYOUT && data.custom_chars) {
            data.chars = data.custom_chars;
        }
        render();
    }
    else {
        // Set the level to 1 if no data is found in local storage
        set_level(1);
    }

    // Attach key press event handler to the document
    $(document).keypress(keyHandler);

    // Display the active layout of the keyboard
    showActiveLayoutKeyboard();
});

/**
 * Initializes the start time for statistics if it hasn't been set already.
 * If `start_time` is undefined or null, it sets `start_time` to the current time in seconds.
 */
function start_stats() {
    start_time = start_time || Math.floor(new Date().getTime() / 1000);
}

/**
 * Updates the statistics including the hit ratio and hits per minute (HPM).
 * 
 * This function calculates the hit ratio as a percentage of correct hits
 * out of the total hits and the hits per minute based on the elapsed time
 * since the start time. If the hits per minute calculation results in an
 * infinite value, it is set to zero.
 */
function update_stats() {
    if (start_time) {
        var current_time = (Math.floor(new Date().getTime() / 1000));
        ratio = Math.floor(
            hits_correct / (hits_correct + hits_wrong) * 100
        );
        hpm = Math.floor(
            (hits_correct + hits_wrong) / (current_time - start_time) * 60
        );
        if (!isFinite(hpm)) { hpm = 0; }
    }
}

/**
 * Sets the current level and initializes relevant data.
 * 
 * @param {number} l - The level to set.
 */
function set_level(l) {
    data.in_a_row = {};
    for (var i = 0; i < data.chars.length; i++) {
        data.in_a_row[data.chars[i]] = data.consecutive;
    }
    data.in_a_row[data.chars[l]] = 0;
    data.level = l;
    data.word_index = 0;
    data.word_errors = {};
    data.word = generate_word();
    data.keys_hit = "";
    save();
    render();
}

/**
 * Sets the current layout and initializes related data.
 *
 * @param {string} l - The name of the layout to set.
 */
function set_layout(l) {
    data.current_layout = l
	data.chars = layouts[l]
    data.in_a_row = {};
    for(var i = 0; i < data.chars.length; i++) {
        data.in_a_row[data.chars[i]] = data.consecutive;
    }
    data.word_index = 0;
    data.word_errors = {};
    data.word = generate_word();
    data.keys_hit = "";
    save();
    render();

    showActiveLayoutKeyboard();
}

/**
 * Handles key press events, updating game statistics and state based on the key pressed.
 * 
 * @param {Event} e - The key press event object.
 */
function keyHandler(e) {
    start_stats();

    $('.key').removeClass('fade-out');

    var key = String.fromCharCode(e.which);
    if (data.chars.indexOf(key) > -1){
        e.preventDefault();
    }
    else {
        return;
    }
    data.keys_hit += key;
    if(key == data.word[data.word_index]) {
        hits_correct += 1;
        data.in_a_row[key] += 1;
        (new Audio("click.mp3")).play();
    }
    else {
        hits_wrong += 1;
        data.in_a_row[data.word[data.word_index]] = 0;
        data.in_a_row[key] = 0;
        (new Audio("clack.mp3")).play();
        data.word_errors[data.word_index] = true;
    }
    data.word_index += 1;
    if (data.word_index >= data.word.length) {
        setTimeout(next_word, 400);
    }

    update_stats();

    render();
    save();

    $('.key').addClass('fade-out');
    removeFadingAnimation(data.word[data.word_index]); 
}

/**
 * Advances to the next word, updating relevant game state and statistics.
 */
function next_word(){
	if(get_training_chars().length == 0) {
		level_up();
	}
	data.word = generate_word();
	data.word_index = 0;
	data.keys_hit = "";
	data.word_errors = {};
	update_stats();

    render();
    save();
}

/**
 * Increases the level by one, if possible, and updates the game state.
 */
function level_up() {
    if (data.level + 1 <= data.chars.length - 1) {
        (new Audio('ding.wav')).play();
    }
    l = Math.min(data.level + 1, data.chars.length);
    set_level(l);
}

/**
 * Saves the current game state to local storage.
 */
function save() {
    localStorage.data = JSON.stringify(data);
}

/**
 * Loads the game state from local storage.
 */
function load() {
    data = JSON.parse(localStorage.data);
}

/**
 * Renders the entire game interface, including layout, level, word, and statistics.
 */
function render() {
    render_layout();
    render_level();
    render_word();
    render_level_bar();
    render_rigor();
    render_stats();
    render_keyboard();
}

/**
 * Renders the layout selection interface.
 */
function render_layout() {
    var layouts_html = "<span id='layout'>";
    for(var layout in layouts){
        if(data.current_layout == layout){
            layouts_html += "<span style='color: #F78D1D' onclick='set_layout(\"" + layout + "\");'> "
        } else {
            layouts_html += "<span style='color: #AAA' onclick='set_layout(\"" + layout + "\");'> "
        }
        layouts_html += layout + "</span>";
    }
    layouts_html += "</span>";
    $("#layout").html('click to set layout: ' + layouts_html);
}

/**
 * Renders the level selection interface.
 */
function render_level() {
    var chars = "<span id='level-chars-wrap'>";
    var level_chars = get_level_chars();
    var training_chars = get_training_chars();
    for (var c in data.chars) {
        if(training_chars.indexOf(data.chars[c]) != -1) {
            chars += "<span style='color: #F78D1D' onclick='set_level(" + c + ");'>"
        }
        else if (level_chars.indexOf(data.chars[c]) != -1) {
            chars += "<span style='color: #000' onclick='set_level(" + c + ");'>"
        }
        else {
            chars += "<span style='color: #AAA' onclick='set_level(" + c + ");'>"
        }
        if (data.chars[c] == ' ') {
            chars += "&#9141;";
        }
        else {
            chars += data.chars[c];
        }
        chars += "</span>";
    }
    chars += "</span>";
    $("#level-chars").html('click to set level: ' + chars);

    if (data.current_layout == CUSTOM_LAYOUT) {
        $('#level-chars').append('<a id="edit-custom-chars" href="#" data-toggle="modal" data-target="#custom-chars-modal"></a>');
        $('#level-chars #edit-custom-chars').append(' (<span style="color: #f78d1d">edit</span>)');

        $editCustomCharsLink = $('#edit-custom-chars');
        $editCustomCharsLink.click(function() {
            var $customCharsModal = $('#custom-chars-modal');
            var customChars = window.data.custom_chars || window.layouts[data.current_layout];
            $customCharsModal.find('textarea').val(customChars);

            $(document).off('keypress');
        });

        $customCharsModalOkButton = $('#custom-chars-modal--ok-button');
        $customCharsModalOkButton.click(function() {
            var $customCharsModal = $('#custom-chars-modal');
            var customCharsSubmitted = $customCharsModal.find('textarea').val();
            var customCharsProccessed = customCharsSubmitted;
            $customCharsModal.modal("hide");
            window.layouts[data.current_layout] = customCharsProccessed;
            window.data.chars = customCharsProccessed;
            window.data.custom_chars = customCharsProccessed;
            render_level();
            save();

            render_keyboard();

            $(document).keypress(keyHandler);
        });
    }
}

/**
 * Renders the rigor (intensity) setting interface.
 */
function render_rigor() {
    chars = "<span id='rigor-number' onclick='inc_rigor();'>";
    chars += '' + data.consecutive;
    chars += '<span>';
    $('#rigor').html('click to set intensity: ' + chars);
}

/**
 * Renders the game statistics.
 */
function render_stats() {
    $("#stats").text([
        "raw WPM: ", hpm / 5, " ",
        "accuracy: ", ratio, "%"
    ].join(""));
}

/**
 * Increases the rigor (intensity) setting.
 */
function inc_rigor() {
    data.consecutive += 1;
    if (data.consecutive > 9) {
        data.consecutive = 2;
    }
    render_rigor();
}

/**
 * Renders the level progress bar.
 */
function render_level_bar() {
    training_chars = get_training_chars();
    if(training_chars.length == 0) {
        m = data.consecutive;
    }
    else {
        m = 1e100;
        for(c in training_chars) {
            m = Math.min(data.in_a_row[training_chars[c]], m);
        }
    }
    m = Math.floor($('#level-chars-wrap').innerWidth() * Math.min(1.0, m / data.consecutive));
    $('#next-level').css({'width': '' + m + 'px'});

}

/**
 * Renders the current word and the keys hit so far.
 */
function render_word() {
    var word = "";
    for (var i = 0; i < data.word.length; i++) {
        sclass = "normalChar";
        if (i > data.word_index) {
            sclass = "normalChar";
        }
        else if (i == data.word_index) {
            sclass = "currentChar";
        }
        else if(data.word_errors[i]) {
            sclass = "errorChar";
        }
        else {
            sclass = "goodChar";
        }
        word += "<span class='" + sclass + "'>";
        if(data.word[i] == " ") {
            word += "&#9141;";
        }
        else if(data.word[i] == "&") {
            word += "&amp;";
        }
        else {
            word += data.word[i];
        }
        word += "</span>";
    }
    var keys_hit = "<span class='keys-hit'>";
    for(var d in data.keys_hit) {
        if (data.keys_hit[d] == ' ') {
            keys_hit += "&#9141;";
        }
        else if (data.keys_hit[d] == '&') {
            keys_hit += "&amp;";
        }
        else {
            keys_hit += data.keys_hit[d];
        }
    }
    for(var i = data.word_index; i < data.word_length; i++) {
        keys_hit += "&nbsp;";
    }
    keys_hit += "</span>";
    $("#word").html(word + "<br>" + keys_hit);

}

/**
 * Generates a new word based on the current level and training characters.
 * 
 * @returns {string} The generated word.
 */
function generate_word() {
    word = '';
    
    $('.key').removeClass('fade-out');
    $('.key').addClass('fade-out');
    

    for(var i = 0; i < data.word_length; i++) {
        c = choose(get_training_chars());
        if(c != undefined && c != word[word.length-1]) {
            word += c;
        }
        else {
            word += choose(get_level_chars());
        }
    }
    removeFadingAnimation(word[0]); 

    return word;
}

/**
 * Gets the characters available at the current level.
 * 
 * @returns {Array<string>} The characters available at the current level.
 */
function get_level_chars() {
    return data.chars.slice(0, data.level + 1).split('');
}

/**
 * Gets the characters that are still being trained.
 * 
 * @returns {Array<string>} The characters that are still being trained.
 */
function get_training_chars() {
    var training_chars = [];
    var level_chars = get_level_chars();
    for(var x in level_chars) {
        if (data.in_a_row[level_chars[x]] < data.consecutive) {
            training_chars.push(level_chars[x]);
        }
    }
    return training_chars;
}

/**
 * Chooses a random element from an array.
 * 
 * @param {Array} a - The array to choose from.
 * @returns {*} A random element from the array.
 */
function choose(a) {
    return a[Math.floor(Math.random() * a.length)];
}

function render_keyboard() {
    $('.key').removeClass('fade-out');
    showActiveLayoutKeyboard();
    $('.key').addClass('fade-out');
    if(data.word[data.word_index]) removeFadingAnimation(data.word[data.word_index]);
}

/**
 * Shows the active layout keyboard and applies color settings.
 */
function showActiveLayoutKeyboard() {
    // Hide all, then show the active.
    $('.keyboard-layout').hide();
    var currentLayout = data.current_layout;
    var isColored = $('#keeb-color--checkbox').is(':checked');
    // Custom chars have no default layout.
    if (currentLayout != CUSTOM_LAYOUT) {
        $('.keyboard-layout[data-layout="' + currentLayout + '"]').show()
    }
    if (isColored) {
        $('.keyboard-layout[data-layout="' + currentLayout + '"]').addClass('color');
        data.keyboard_color = true;
    } else {
        $('.keyboard-layout[data-layout="' + currentLayout + '"]').removeClass('color');
        data.keyboard_color = false;
    }
    // Remove focus from the checkbox so it doesn't interfere with key presses.
    $('#keeb-color--checkbox').blur();
}


/**
 * Renders the rigor (intensity) setting interface.
 */
function render_rigor() {
    chars = "<span id='rigor-number' onclick='inc_rigor();'>";
    chars += '' + data.consecutive;
    chars += '<span>';
    $('#rigor').html('click to set intensity: ' + chars);
}

function removeFadingAnimation(nextKey) {
    leftIndicator = $('.home-row .left.index p').text()[0];
    rightIndicator = $('.home-row .right.index p').text()[0];

    console.log("leftIndicator", leftIndicator);
    console.log("rightIndicator", rightIndicator);


    if (!nextKey) {
        return;
    }

    $('.key').addClass('fade-out');
    // If the key is a space mark...
    if (nextKey == ' ') {
        // ...remove fading animation from space key

        $('.space').removeClass('fade-out');
    // ...otherwise, if the key is leftIndicator or rightIndicator...
    } else if (nextKey == leftIndicator || nextKey == rightIndicator) {
        if (nextKey == leftIndicator) {

            $('.left.index:has(.indicator)').removeClass('fade-out');
        } else {

            $('.right.index:has(.indicator)').removeClass('fade-out');
            
        }
    // ...otherwise, if the key does not require a shift key...
    } else if (!shift_keys.includes(nextKey)) {
        console.log("not in shift keys", nextKey);
        // Loop through all keys and remove fading animation from the key that matches the next key
        $('.key').each(function() {
            if ($(this).text()[0] == nextKey.toLowerCase()) {
                // all lower case except for indicators
                if (other_keys.includes($(this).text()[0]) && $(this).text()[0] == nextKey) {
                    console.log("here1");
                    $(this).removeClass('fade-out');
                    return;
                } 


                if ($(this).text()[0] == nextKey || $(this).text() == nextKey) {
                    $(this).removeClass('fade-out');
                } else {
                    $(this).removeClass('fade-out');
                    if ($(this).hasClass('left')) {
                        $('.right.shift').removeClass('fade-out');
                    } 
                }
            } else if ($(this).text()[0] == nextKey) {
                console.log("not lower case", $(this).text()[0]);
                $(this).removeClass('fade-out');
                if ($(this).hasClass('left')) {
                    $('.right.shift').removeClass('fade-out');
                } else {
                    $('.left.shift').removeClass('fade-out');
                }
            } else if ($(this).text()[1] == nextKey) {
                $(this).removeClass('fade-out'); 
            }
        });
    
    } else {
        // If the key is special, loop through all keys
        $('.key').each(function() {
            
            if ($(this).text()[0] == nextKey.toLowerCase()) {
                $(this).removeClass('fade-out'); 
                if ($(this).hasClass('left')) {
                    $('.right.shift').removeClass('fade-out');
                } else {
                    $('.left.shift').removeClass('fade-out');
                }
            } 
        });
    }
    
}


