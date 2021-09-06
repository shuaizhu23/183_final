/// server javascript, doesn't need dashboard reload
// object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    app.data = {
      selection_done: false,
      uploading: false,
      upload_done: false,
      uploaded: false,
      img_url: "",

      add_post_content: "",
      rows: [],
    };

    // file selected for upload.
    app.file = null;

    app.enumerate = (a) => {
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.decorate = (a) => {
        /// js object
        a.map((e) => {e._state = {post_content: "clean", full_name: "clean"} ;});
        a.map((e) => {
          if (user_email != e.user_email) {
            e.owned = false;
          } else {
            e.owned = true;
          }
        });
        return a;
    }

    app.set_task = function(r_idx, t_bool) {
      // console.log(!t_bool);
      let task = app.vue.rows[r_idx];
      Vue.set(task, 'task_done', !t_bool);
      axios.post(set_task_url, {id: task.id, task_done: !t_bool});
    };

    app.upload_complete = function (file_name, file_type) {
        app.vue.uploading = false;
        app.vue.upload_done = true;
        app.vue.uploaded_file = file_name;
    };

    app.select_file = function (event) {
        // Reads the file.
        let input = event.target;
        app.file = input.files[0];
        if (app.file) {
            app.vue.selection_done = true;
            // We read the file from local disk
            let reader = new FileReader();
            reader.addEventListener("load", function () {
                app.vue.img_url = reader.result;
            });
            reader.readAsDataURL(app.file);
        }
    };

    app.upload_complete = function (file_name, file_type, full_url) {
      app.vue.uploading = false;
      app.vue.uploaded = true;
      console.log(full_url);
      document.getElementById("task_task_img").value = full_url;
    };

    app.upload_file = function (event) {
        // We need the event to find the file.
        // ??
        let self = this;
        // Reads the file.
        let input = event.target;
        // select single file and upload single file
        let file = input.files[0];
        if (file) {
            self.uploading = true;
            let file_type = file.type;
            let file_name = file.name;
            let full_url = file_upload_url + "&file_name=" + encodeURIComponent(file_name)
                + "&file_type=" + encodeURIComponent(file_type);
            // Uploads the file, using the low-level streaming interface.
            // avoid any encoding.
            app.vue.uploading = true;
            let req = new XMLHttpRequest();
            req.addEventListener("load", function () {
                app.upload_complete(file_name, file_type, full_url)
            });
            req.open("PUT", full_url, true);
            req.send(file);
        }
    };

    app.methods = {
      set_task: app.set_task,
      select_file: app.select_file,
      upload_file: app.upload_file,
    };

    // create the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        axios.get(load_tasks_url).then(function (response) {
            // console.log(response)
            app.vue.rows = app.enumerate(response.data.rows);
        });
    };

    // Call to the initializer.
    app.init();
};

// takes the (empty) app object, and initializes it,
init(app);
