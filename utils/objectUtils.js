// normalize a string
function normalize(str) {
    // remove all <CR>
    str = str.replace(/\r/g, '')
    // no extra newlines up front
    str = str.replace(/^\n+/, '')
    // and a single newline at the end
    str = str.replace(/\n+$/, '') + '\n'
    return str
}


//
function normalizeText(str) {
    // remove all <CR>
    str = str.replace(/\r/g, '')
    // no extra newlines up front
    str = str.replace(/^\n+/, '')
    // 
    str = str.replace(/\n+$/, '')
    return str
}


function indent(str) {
    return (
        str.trim()
        .split('\n')
        .map(x => ' ' + x)
        .join('\n') + '\n'
    )
}


function outdent(str) {
    return str.split('\n')
        .map(x => x.replace(/^ /, ''))
        .join('\n')
}


function negateExceptForZero(n) {
    return n === 0 ? n : -n
}


function simpleSign(n) {
    return Math.sign(n) || (Object.is(n, -0) ? -1 : 1)
}


function comMessage(commit) {
    return normalize(commit.slice(commit.indexOf('\n\n') + 2))
}


function comHeader(commit) {
    return commit.slice(0, commit.indexOf('\n\n'))
}


// convert zone offset from minutes to hours
function formatTimezoneOffset(minutes) {

    let sign = simpleSign(negateExceptForZero(minutes))
    minutes = Math.abs(minutes)
    let hours = Math.floor(minutes / 60)
    minutes -= hours * 60
    let strHours = String(hours)
    let strMinutes = String(minutes)
    if (strHours.length < 2) strHours = '0' + strHours
    if (strMinutes.length < 2) strMinutes = '0' + strMinutes

    return (sign === -1 ? '-' : '+') + strHours + strMinutes
}


// Determine timestamp and offset zone
function determineTime() {
    let authorDateTime = new Date();
    let timestamp = Math.floor(authorDateTime.valueOf() / 1000)
    //get zone offset in minutes 
    let timezoneOffset = authorDateTime.getTimezoneOffset()

    return [timestamp, timezoneOffset]
}


// Form the date
function formDate({
    input
}) {
    let time;
    if (input)
        time = new Date();
    else
        time = new Date(input);

    return time.valueOf();
}


// Update a blob entry in the master tree
function updateBlobEntry({
    fpath,
    operation,
    oid,
    master_trees,
    pr_trees
}) {

    var parent = getParentPath(fpath);
    var fname = removeParentPath(fpath);

    // Update master branch
    if (operation == "add")
        master_trees[parent][fname] =
        pr_trees[parent][fname];
    else if (operation == "delete")
        delete master_trees[parent][fname];
    else if (operation == "modify")
        master_trees[parent][fname].oid = oid;
    else
        throw new Error(`${operation} is not supported`);

    return master_trees;
}


// Add a new subdir to the tree
function addSubdir(entry) {

    // compute the tree hash
    var object = createGitObject('tree', [entry]);

    var entry = ['40000', 'tree', object.id, entry.path];

    return {
        entry,
        object
    };
}


// Extract parents from a commit object
function extractParents(commitInfo) {

    var parents = [];
    for (p in commitInfo.parents) {
        parents.push(commitInfo.parents[p].commit);
    }

    return parents;
}


// Populate the popup window with parent info
function setParentInfo(commit) {

    var parent_info = '';

    parent_info += `author: ${commit.author.name} <${commit.author.email}> \n`
    parent_info += `committer: ${commit.committer.name} <${commit.committer.email}> \n`
    //parent_info += `date: ${get_standard_time(commit.author.date)}\n`
    parent_info += `date: ${commit.author.date}\n`
    parent_info += `message: ${commit.message}\n`

    // Fill the parent info form
    document.getElementById('parent_info').value = parent_info;
}
