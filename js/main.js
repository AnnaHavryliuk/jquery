/*
*
* 1. FORM VALIDATION + CALENDAR
*
*/
$(function() {
/*
* - calendar
*/
  var validationRules = {
          minlength: isMinLengthInvalid
        , maxlength: isMaxLengthInvalid
        , regexp: isValueInvalid
      }
    , $form = $('.validate')
    , $calendar = $form.find('.calendar')
    , $calendarHeader = $calendar.find('.calendar-header')
    , $monthButton = $calendarHeader.find('.calendar-title').filter('.month')
    , $yearButton = $calendarHeader.find('.calendar-title').filter('.year')
    , $calendarRows = $calendar.find('table').find('tbody').find('tr')
    , $calendarCells = []

    , MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    , DAYS_NUMBER_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    , currentDate
    , currentMonthIndex
    , currentYear

    , fillCalendar = function () {
        currentDate.setDate(1);
        var weekday = currentDate.getDay()
          , day = 1;

        $monthButton.text(MONTHS[currentMonthIndex]);
        $yearButton.filter('.year').text(currentYear);
        _.each($calendarCells, function (row, rowIndex) {
          _.each(row, function (cell, cellIndex) {
            var isTrueDay = day <= DAYS_NUMBER_IN_MONTH[currentMonthIndex]
              , isTrueCell = rowIndex === 0 && cellIndex >= weekday;
              if (isTrueDay && (weekday === 0 || rowIndex > 0 || isTrueCell)) {
                $(cell).text(day);
                day++;
              } else {
                $(cell).text('');
              }
          })
        });
      };

  _.each($calendarRows, function(item) {
    var temp = $(item).find('td');
    $calendarCells.push(temp);
  })

  $('.calendar-button').on('click', function () {
    var $date = $('#date');
    if ($calendar.hasClass('invisible')) {
      if ($date.val() && !validation($date, validationRules)) {
        var date = $date.val().split('.');
        currentDate = new Date(date[2], date[1] - 1, date[0])
      } else {
        currentDate = new Date();
      }
      currentMonthIndex = currentDate.getMonth()
      currentYear = currentDate.getFullYear()
      fillCalendar();
    }
    $calendar.toggleClass('invisible');
  });

  $monthButton.on('click', function () {
    $(this).addClass('active');
    $yearButton.removeClass('active');
  });

  $yearButton.on('click', function () {
    $(this).addClass('active');
    $monthButton.removeClass('active');
  });

  $calendarHeader.find('.arrow-left').on('click', function () {
    if ($monthButton.hasClass('active')) {
      if (currentMonthIndex === 0) {
        currentYear--;
        currentMonthIndex = 11;
      } else {
        currentMonthIndex--;
      }
    } else {
      currentYear--;
    }
    currentDate = new Date(currentYear, currentMonthIndex, 1);
    fillCalendar();
  })
  $calendarHeader.find('.arrow-right').on('click', function () {
    if ($monthButton.hasClass('active')) {
      if (currentMonthIndex === 11) {
        currentYear++;
        currentMonthIndex = 1;
      } else {
        currentMonthIndex++;
      }
    } else {
      currentYear++;
    }
    currentDate = new Date(currentYear, currentMonthIndex, 1);
    fillCalendar();
  })

  var $inputDate = $('#date');
  _.each($calendarCells, function(row) {
    _.each(row, function (cell) {
      $(cell).on('click', function() {
        var cellText = $(cell).text();
        if (cellText) {
          var date = numberToString(cellText) + '.' + numberToString(currentMonthIndex + 1) + '.' + currentYear;
        $inputDate.val(date);
        }
    });
    });
  });

/*
*  - validation
*/
  var $formEls = $form.find('[name]')
    , $submit = $form.find('input[type=\'submit\']');

  $submit.on('click', function (event) {
    $formEls.each(function (index, elem) {
      var result
        , errorMessage;

        result = validation(elem, validationRules);
        result = !(errorMessage = result);

      if (!result) {
        event.preventDefault();
        createMessageBox($(elem), errorMessage);
        setTimeout(removeMessageBox, 2000);
        return false;
      }
    })
  })
});

function validation (elem, rules) {
  var result = false
    , elem = $(elem)
    , elemValue = elem.val()
    , elemName = elem.attr('id');
    if (elemValue) {
      _.some(rules, function (rule, name) {
        var attrValue = elem.attr('data-' + name);

        if (attrValue) {
          result = rule(elemValue, attrValue, elemName);
          if (result) {
            return true;
          }
        }
        return false;
      });
    } else {
      result = requiredValidation(elem, elemName);
    }
  return result;
}

function requiredValidation(elem, elemName) {
  var result = false
    , isRequired = elem.attr('data-required');

  if (isRequired) {
    result = 'Fill ' + elemName + ' field';
  }
  return result;
}

function isMinLengthInvalid(elemValue, length, elemName) {
  var valueLength = elemValue.length
    , result = false;
  elemName = elemName || 'text';
  length = parseInt(length);

  if (valueLength < length) {
    result = elemName + ' should have at least ' + length + ' symbols';
  }
  return result;
}

function isMaxLengthInvalid(elemValue, length, elemName) {
  var valueLength = elemValue.length
    , result = false;
  elemName = elemName || 'text';
  length = parseInt(length);

  if (valueLength > length) {
    result = elemName + ' should have  maxsimum ' + length + ' symbols';
  }
  return result;
}

function isValueInvalid(elemValue, regexp, elemName) {
  elemName = elemName || 'text';
  regexp = new RegExp(regexp);
  var result = !regexp.test(elemValue) && ('wrong format of ' + elemName);
  return result;
}

function createMessageBox(elem, text) {
  message = '<div class=\"message\">' + text + '</div>';
  triangle = '<div class=\"triangle\"></div>';
  messageBox = $('<div class=\"message-box\">' + triangle + message + '</div>');
  elem.after(messageBox);
}

function removeMessageBox() {
  $('.message-box').remove();
}

function numberToString(number) {
  var result = '' + number;

  if (number < 10) {
      result = '0' + result;
    }
  return result;
}

/*
*
* 2. COUNTDOWN TIMER
*
*/
$(function() {
  var $timer = $('.countdown')
    , timerStartValues = $timer.attr('data-countdown-start').split(':')
    , $timerEls = $timer.find('.box')

    , startTime = (new Date(2016, 07, 29)).getTime()
    , SECOND_TO_MILLISECONDS = 1000
    , dateDifference = parseInt((Date.now() - startTime) / SECOND_TO_MILLISECONDS)

    , timerValues = {}
    , keys = ['days', 'hours', 'minutes', 'seconds']
    , maxTimerValues = [null, 24, 60, 60]
    , timerId
    , displayTimerValues = function (value, key) {
        value = numberToString(value);
        $timerEls.find('[data-' + key + ']').text(value);
      };

  if (dateDifference) {
    var rules = [86400, 3600, 60, 1]
      , difference
      , temp = timeToSeconds(timerStartValues, rules);
    difference = temp - dateDifference;
    timerStartValues = secondsToTime(difference, maxTimerValues);
  }

  _.each(timerStartValues, function (item, index, list) {
    var key = keys[index];
    timerValues[key] = parseInt(item);
    displayTimerValues(item, key);
  });

  var timeToChangeIndex = 0
    , lastKeyIndex = keys.length - 1
    , countdown = function (keyIndex) {
        var key = keys[keyIndex]
          , time = timerValues[key];
        if (!time) {
          if (keyIndex > timeToChangeIndex) {
            countdown(keyIndex - 1);
          } else {
            if (timeToChangeIndex < lastKeyIndex) {
              timeToChangeIndex++;
            } else {
              clearInterval(timerId);
            }
          }
          timerValues[key] = maxTimerValues[keyIndex] - 1;
        } else {
          timerValues[key] = --time;
        }
        displayTimerValues(timerValues[key], key);
      };

  timerId = setInterval(function () {
    countdown(lastKeyIndex);
  }, SECOND_TO_MILLISECONDS);
});

function timeToSeconds(valueToConvert, rules) {
  var result = 0;
  if (_.isArray(valueToConvert) && _.isArray(rules)) {
    _.each(valueToConvert, function(item, index) {
      result += parseInt(item) * rules[index];
    });
  }
  return result;
}

function secondsToTime(valueToConvert, rules) {
  var result = []
    , value
    , temp;
  if (!isNaN(valueToConvert) && _.isArray(rules)) {
    for(var i = rules.length - 1; i >= 0; i--) {
      var maxValue = rules[i];
      if (maxValue) {
        temp = parseInt(valueToConvert / maxValue);
        value = valueToConvert - temp * maxValue;
      } else {
        value = valueToConvert;
      }
        valueToConvert = temp;
        result.unshift(value);
    }
  }
  return result;
}