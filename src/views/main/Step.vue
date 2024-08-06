<!-- <template>
  <section class="multistep-form-sec">
    <div class="container">
      <div class="text">
        <h1>Create a New Listing</h1>
      </div>
      <div class="form-container">
        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              class="nav-link active one"
              data-bs-toggle="tab"
              data-bs-target="#step1"
              type="button"
              role="tab"
              aria-controls="step1"
              aria-selected="true"
            >
              1
            </button>
            <button
              class="nav-link two"
              data-bs-toggle="tab"
              data-bs-target="#step2"
              type="button"
              role="tab"
              aria-controls="step2"
              aria-selected="false"
            >
              2
            </button>
            <button
              class="nav-link three"
              data-bs-toggle="tab"
              data-bs-target="#step3"
              type="button"
              role="tab"
              aria-controls="step3"
              aria-selected="false"
            >
              3
            </button>
            <button
              class="nav-link four"
              data-bs-toggle="tab"
              data-bs-target="#step4"
              type="button"
              role="tab"
              aria-controls="step4"
              aria-selected="false"
            >
              4
            </button>
            <button
              class="nav-link five"
              data-bs-toggle="tab"
              data-bs-target="#step5"
              type="button"
              role="tab"
              aria-controls="step5"
              aria-selected="false"
            >
              5
            </button>
            <button
              class="nav-link six"
              data-bs-toggle="tab"
              data-bs-target="#step6"
              type="button"
              role="tab"
              aria-controls="step6"
              aria-selected="false"
            >
              6
            </button>
          </div>

          <!-- <ul class="nav nav-tabs" id="nav-tab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active one" data-bs-toggle="tab" data-bs-target="#step1" type="button" role="tab" aria-controls="step1" aria-selected="true">1</button>
                        </li>
                            <button class="nav-link two" data-bs-toggle="tab" data-bs-target="#step2" type="button" role="tab" aria-controls="step2" aria-selected="false">2</button>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link three" data-bs-toggle="tab" data-bs-target="#step3" type="button" role="tab" aria-controls="step3" aria-selected="false">3</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link four" data-bs-toggle="tab" data-bs-target="#step4" type="button" role="tab" aria-controls="step4" aria-selected="false">4</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link five" data-bs-toggle="tab" data-bs-target="#step5" type="button" role="tab" aria-controls="step5" aria-selected="false">5</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link six" data-bs-toggle="tab" data-bs-target="#step6" type="button" role="tab" aria-controls="step6" aria-selected="false">6</button>
                        </li>
                    </ul> -->
        </nav>
        <form action="" method="" id="stepper-form">
          <div class="tab-content" id="nav-tabContent">
            <!-- Tab 1 -->
            <div class="tab-pane fade tab-one show active" id="step1" role="tabpanel" aria-labelledby="tab-1">
              <div class="shadow-wraper">
                <div class="step1-form">
                  <h4 class="title">Listing Title</h4>
                  <input type="text" name="text" id="text-type" placeholder="Enter title " />
                  <span id="count-char"></span>
                  <h4 class="property-type">Property Type</h4>
                  <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio"
                      id="btnradio1"
                      autocomplete="off"
                    />
                    <label class="radio-label" for="btnradio1">Studio</label>

                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio"
                      id="btnradio2"
                      autocomplete="off"
                    />
                    <label class="radio-label" for="btnradio2">Apartment</label>

                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio"
                      id="btnradio3"
                      autocomplete="off"
                    />
                    <label class="radio-label" for="btnradio3">Home</label>

                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio"
                      id="btnradio4"
                      autocomplete="off"
                      checked
                    />
                    <label class="radio-label" for="btnradio4">Loft</label>

                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio"
                      id="btnradio5"
                      autocomplete="off"
                    />
                    <label class="radio-label" for="btnradio5">Condo</label>

                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio"
                      id="btnradio6"
                      autocomplete="off"
                    />
                    <label class="radio-label" for="btnradio6">Duplex</label>
                  </div>
                </div>
              </div>
              <div class="buttons">
                <button type="button" class="prev" id="prev1" style="visibility: hidden">Back</button>
                <button type="button" class="next" id="next1" disabled>Next</button>
              </div>
            </div>

            <!-- Tab 2 -->
            <div class="tab-pane tab-two fade" id="step2" role="tabpanel" aria-labelledby="tab-2">
              <div class="shadow-wraper">
                <h2 class="photos">Photos</h2>
                <div class="bedroom border-bottom">
                  <h4>Bedroom</h4>
                  <div class="grid bedrooms">
                    <!-- <label class="upload upload-border" id="">
                                            <img src="assets/images/download-arrow.svg" alt="download arrow">
                                            <h4>Upload Imge</h4>
                                            <p>400 * 400</p>
                                            <input type="file" style="visibility: hidden;" class="input1" id="upload1" name="upload_imgs[]" multiple/>
                                        </label> -->
                    <!-- <div class="upload quote-imgs-thumbs--hidden" id="img_preview" aria-live="polite"></div> -->
                    <label for="files1" class="upload upload-border" id="">
                      <img src="assets/images/download-arrow.svg" alt="download arrow" />
                      <h4>Upload Imge</h4>
                      <p>400 * 400</p>
                      <input class="file-field" id="files1" type="file" multiple />
                    </label>
                    <div>
                      <div id="sortableImgThumbnailPreview" class="sortableImgThumbnailPreview1"></div>
                    </div>
                  </div>
                </div>

                <div class="bedroom border-bottom">
                  <h4>Living Room</h4>
                  <div class="grid">
                    <label for="files2" class="upload upload-border" id="">
                      <img src="assets/images/download-arrow.svg" alt="download arrow" />
                      <h4>Upload Imge</h4>
                      <p>400 * 400</p>
                      <input class="file-field" id="files2" type="file" multiple />
                    </label>
                    <div>
                      <div id="sortableImgThumbnailPreview" class="sortableImgThumbnailPreview2"></div>
                    </div>
                  </div>
                </div>

                <div class="bedroom border-bottom">
                  <h4>Kitchen</h4>
                  <div class="grid">
                    <label for="files3" class="upload upload-border" id="">
                      <img src="assets/images/download-arrow.svg" alt="download arrow" />
                      <h4>Upload Imge</h4>
                      <p>400 * 400</p>
                      <input class="file-field" id="files3" type="file" multiple />
                    </label>
                    <div>
                      <div id="sortableImgThumbnailPreview" class="sortableImgThumbnailPreview3"></div>
                    </div>
                  </div>
                </div>

                <div class="bedroom border-bottom">
                  <h4>Bathroom</h4>
                  <div class="grid">
                    <label for="files4" class="upload upload-border" id="">
                      <img src="assets/images/download-arrow.svg" alt="download arrow" />
                      <h4>Upload Imge</h4>
                      <p>400 * 400</p>
                      <input class="file-field" id="files4" type="file" multiple />
                    </label>
                    <div>
                      <div id="sortableImgThumbnailPreview" class="sortableImgThumbnailPreview4"></div>
                    </div>
                  </div>
                </div>

                <div class="bedroom">
                  <h4>Other</h4>
                  <div class="grid">
                    <label for="files5" class="upload upload-border" id="">
                      <img src="assets/images/download-arrow.svg" alt="download arrow" />
                      <h4>Upload Imge</h4>
                      <p>400 * 400</p>
                      <input class="file-field" id="files5" type="file" value="something" multiple />
                    </label>
                    <div>
                      <div id="sortableImgThumbnailPreview" class="sortableImgThumbnailPreview5"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="buttons">
                <button type="button" class="prev" id="prev">Back</button>
                <button type="button" class="next" id="next" disabled>Next</button>
              </div>
            </div>

            <!-- Tab 3 -->
            <div class="tab-pane fade tab-three" id="step3" role="tabpanel" aria-labelledby="tab-3">
              <div>
                <div class="shadow-wraper">
                  <h2 class="photos pb-3">Select Number Of</h2>
                  <div class="increments-wraper">
                    <div class="guest">
                      <h4>Guest</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="number" name="number" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>

                      <h4>Bedrooms</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="bedroom" name="bedroom" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>

                      <h4>Beds</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="bed" name="bed" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>

                      <h4>Bathrooms</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="room" name="room" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <!-- col 2 -->
                    <div class="guest">
                      <h4>Kings</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="king" name="king" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>

                      <h4>Queens</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="queen" name="queen" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>

                      <h4>Doubles</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="doubles" name="doubles" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>

                      <h4>Twins</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="twin" name="twin" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <!-- col 3 -->
                    <div class="guest">
                      <h4>Sofa Beds</h4>
                      <div class="buton-wraper">
                        <button type="button" class="minus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                            />
                          </svg>
                        </button>
                        <input type="number" id="safe" name="safe" value="1" />
                        <button type="button" class="plus">
                          <svg width="14.5px" height="14.5px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <label for="textarea" id="text-label">Property Description</label>
                  <textarea
                    id="textarea"
                    placeholder="Open and spacious 2-bedroom apartment right in downtown Charleston. A 5-minute walk from King Street where you’ll find the city’s best shopping, restaurants, and bars!"
                  ></textarea>
                  <p id="character-counter"></p>
                  <div class="group-btn-container">
                    <label for="broup-btns">Select Amenities</label>
                    <div class="btn-group count" role="group" aria-label="Basic checkbox toggle button group">
                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck1" autocomplete="off" />
                      <label class="label-btn" for="btncheck1">
                        <img src="assets/images/wifi.svg" alt="wifi" />
                        <span>Wifi</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck2" autocomplete="off" />
                      <label class="label-btn" for="btncheck2">
                        <img src="assets/images/workarea.svg" alt="work area" />
                        <span>Work Area</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck3" autocomplete="off" />
                      <label class="label-btn" for="btncheck3">
                        <img src="assets/images/kitchen.svg" alt="kitchen" />
                        <span>Full Kitchen</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck4" autocomplete="off" />
                      <label class="label-btn" for="btncheck4">
                        <img src="assets/images/ac.svg" alt="ac" />
                        <span>AC</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck5" autocomplete="off" />
                      <label class="label-btn" for="btncheck5">
                        <img src="assets/images/heater.svg" alt="heater" />
                        <span>Heat</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck6" autocomplete="off" />
                      <label class="label-btn" for="btncheck6">
                        <img src="assets/images/tv.svg" alt="tv" />
                        <span>TV</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck7" autocomplete="off" />
                      <label class="label-btn" for="btncheck7">
                        <img src="assets/images/netflix.svg" alt="Netflix" />
                        <span>Netflix</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck8" autocomplete="off" />
                      <label class="label-btn" for="btncheck8">
                        <img src="assets/images/pool.svg" alt="Pool" />
                        <span>Pool</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck9" autocomplete="off" />
                      <label class="label-btn" for="btncheck9">
                        <img src="assets/images/hothub.svg" alt="hot hub" />
                        <span>Hot Tub</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck10" autocomplete="off" />
                      <label class="label-btn" for="btncheck10">
                        <img src="assets/images/washingmachine.svg" alt="washing machine" />
                        <span>Washer</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck11" autocomplete="off" />
                      <label class="label-btn" for="btncheck11">
                        <img src="assets/images/dryer.svg" alt="Dryer machine" />
                        <span>Dryer</span>
                      </label>

                      <input type="checkbox" class="btn-check checkbox-checked" id="btncheck12" autocomplete="off" />
                      <label class="label-btn" for="btncheck12">
                        <img src="assets/images/blower.svg" alt="blow dryer" />
                        <span>Blow Dryer</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="buttons">
                  <button type="button" class="prev" id="prev2">Back</button>
                  <button type="button" class="next" id="next2" disabled>Next</button>
                </div>
              </div>
            </div>

            <!-- Tab 4 -->
            <div class="tab-pane fade tab-four" id="step4" role="tabpanel" aria-labelledby="tab-4">
              <div>
                <div class="shadow-wraper">
                  <div class="pricing">
                    <h4 class="price">Pricing</h4>
                    <div class="pricing-fields">
                      <label for="night-rate" class="field-label">Nightly Rate</label>
                      <input
                        type="number"
                        name="payments"
                        id="night-rate"
                        class="field-input check-feild"
                        placeholder="$150"
                      />
                    </div>

                    <div class="pricing-fields">
                      <label for="weakly-rate" class="field-label">Weekly Rate</label>
                      <input
                        type="number"
                        name="payments"
                        id="weakly-rate"
                        class="field-input check-feild"
                        placeholder="$700"
                      />
                    </div>

                    <div class="pricing-fields">
                      <label for="monthaly-rate" class="field-label">Monthly Rate</label>
                      <input
                        type="number"
                        name="payments"
                        id="monthaly-rate"
                        class="field-input check-feild"
                        placeholder="$3000"
                      />
                    </div>
                  </div>
                </div>
                <div class="overview-container">
                  <h4 class="program">Work From Anywhere Program</h4>
                  <h5 class="wfa">WFA Overview</h5>
                  <p class="paragraph">
                    The Work From Anywhere program allows guests to receive a 10% monthly discount. This program
                    incentivizes guests to book more frequent extended stays. To qualify, please ensure your home has
                    wifi and a work space.
                  </p>
                  <div class="checkboxs">
                    <label for="optin" class="chekbox-label">
                      <input class="check-feild" type="checkbox" id="optin" name="options" />
                      <span class="chekbox-field"></span>
                      opt in
                    </label>

                    <label for="optout" class="chekbox-label">
                      <input class="check-feild" type="checkbox" id="optout" name="options" />
                      <span class="chekbox-field"></span>
                      opt out
                    </label>
                  </div>
                </div>
                <div class="buttons">
                  <button type="button" class="prev" id="prev4">Back</button>
                  <button type="button" class="next" id="next4" disabled>Next</button>
                </div>
              </div>
            </div>

            <!-- Tab 5 -->
            <div class="tab-pane fade tab-five" id="step5" role="tabpanel" aria-labelledby="tab-5">
              <div class="shadow-wraper">
                <h4 class="address-heading">Address</h4>
                <div class="address-form">
                  <label for="address" class="address-label">Enter Address</label>
                  <input type="text" name="address" id="address" placeholder="Type  your address here" />

                  <label for="map" class="map-label">Map View</label>
                  <iframe
                    width="100%"
                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d27212.426356592307!2d74.33697435944826!3d31.508960212333612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1666350149770!5m2!1sen!2s"
                    width="600"
                    height="450"
                    style="border: 0"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
              <div class="buttons">
                <button type="button" class="prev" id="prev5">Back</button>
                <button type="button" class="next" id="next5" disabled>Next</button>
              </div>
            </div>

            <!-- Tab 6 -->
            <div class="tab-pane fade tab-six" id="step6" role="tabpanel" aria-labelledby="tab-6">
              <div class="shadow-wraper">
                <h4 class="heading-4">Rules & Requirements</h4>
                <h5 class="heading-5">Minimum Stay Requirement</h5>
                <div class="btn-group_2" role="group" aria-label="Basic radio toggle button group">
                  <input
                    type="radio"
                    class="btn-check ischecked-radio"
                    name="btnradio_2"
                    id="btnradio7"
                    autocomplete="off"
                  />
                  <label class="radio-label" for="btnradio7">None</label>

                  <input
                    type="radio"
                    class="btn-check ischecked-radio"
                    name="btnradio_2"
                    id="btnradio8"
                    autocomplete="off"
                  />
                  <label class="radio-label" for="btnradio8">2 Days</label>

                  <input
                    type="radio"
                    class="btn-check ischecked-radio"
                    name="btnradio_2"
                    id="btnradio9"
                    autocomplete="off"
                  />
                  <label class="radio-label" for="btnradio9">3 Days</label>

                  <input
                    type="radio"
                    class="btn-check ischecked-radio"
                    name="btnradio_2"
                    id="btnradio10"
                    autocomplete="off"
                    checked
                  />
                  <label class="radio-label" for="btnradio10">7 Days</label>

                  <input
                    type="radio"
                    class="btn-check ischecked-radio"
                    name="btnradio_2"
                    id="btnradio11"
                    autocomplete="off"
                  />
                  <label class="radio-label" for="btnradio11">30 Days</label>

                  <input
                    type="radio"
                    class="btn-check ischecked-radio"
                    name="btnradio_2"
                    id="btnradio12"
                    autocomplete="off"
                  />
                  <label class="radio-label" for="btnradio12">Other</label>
                </div>
                <div class="strictness">
                  <label class="ploicy">Cancellation Policy</label>
                  <div class="content">
                    <div class="left">
                      <button class="field-style" type="button">Flexible</button>
                      <p class="check-in">Guests can cancel up until 7 days before check-in</p>
                    </div>
                    <div class="middle">
                      <button class="field-style" type="button">Moderate</button>
                      <p class="check-in">Guests can cancel up until 30 days before check-in</p>
                    </div>
                    <div class="right">
                      <button class="field-style" type="button">Strict</button>
                      <p class="check-in">Guests can cancel within 48 hours after booking</p>
                    </div>
                  </div>
                </div>
                <div class="radio-buttons">
                  <label class="house-rules">Basic House Rules</label>
                  <div class="btn-group_2" role="group" aria-label="Basic radio toggle button group">
                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio_3"
                      id="btnradio13"
                      autocomplete="off"
                    />
                    <label class="radio-label" for="btnradio13">No Smoking</label>

                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio_3"
                      id="btnradio14"
                      autocomplete="off"
                    />
                    <label class="radio-label" for="btnradio14">No Pets</label>

                    <input
                      type="radio"
                      class="btn-check ischecked-radio"
                      name="btnradio_3"
                      id="btnradio15"
                      autocomplete="off"
                      checked
                    />
                    <label class="radio-label" for="btnradio15">No Parties</label>
                  </div>
                </div>
                <label class="additional-rules">Additional Rules</label>
                <textarea
                  class="msg-area"
                  placeholder="Open and spacious 2-bedroom apartment right in downtown Charleston. A 5-minute walk from King Street where you’ll find the city’s best shopping, restaurants, and bars!"
                ></textarea>
                <p id="character-counter2"></p>
              </div>

              <div class="buttons">
                <button type="button" class="prev" id="prev6">Back</button>
                <button type="button" class="next" id="next6">Publish</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template> -->
