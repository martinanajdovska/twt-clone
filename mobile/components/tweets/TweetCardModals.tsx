import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NoteCard } from "../community-notes/NoteCard";
import type { IAllNoteItem } from "@/types/community-notes";

type TweetCardModalsProps = {
  retweetMenuVisible: boolean;
  onCloseRetweetMenu: () => void;
  onRetweet: () => void;
  onQuoteTweet: () => void;
  isRetweeted: boolean;
  textColor: string;
  borderColor: string;
  menuBg: string;
  mutedColor: string;
  insetsBottom: number;
  optionsMenuVisible: boolean;
  onCloseOptionsMenu: () => void;
  isSelf: boolean;
  onPin: () => void;
  pinPending: boolean;
  isPinned: boolean;
  onDeletePress: () => void;
  onOpenAddNote: () => void;
  onOpenViewNotes: () => void;
  addNoteModalVisible: boolean;
  onCloseAddNoteModal: () => void;
  addNotePending: boolean;
  addNoteContent: string;
  setAddNoteContent: (value: string) => void;
  onSubmitAddNote: () => void;
  keyboardHeight: number;
  viewNotesModalVisible: boolean;
  onCloseViewNotes: () => void;
  allNotesLoading: boolean;
  allNotes: IAllNoteItem[];
  tweetId: number;
  deleteConfirmVisible: boolean;
  onCloseDeleteConfirm: () => void;
  deletePending: boolean;
  onDeleteConfirm: () => void;
};

export function TweetCardModals({
  retweetMenuVisible,
  onCloseRetweetMenu,
  onRetweet,
  onQuoteTweet,
  isRetweeted,
  textColor,
  borderColor,
  menuBg,
  mutedColor,
  insetsBottom,
  optionsMenuVisible,
  onCloseOptionsMenu,
  isSelf,
  onPin,
  pinPending,
  isPinned,
  onDeletePress,
  onOpenAddNote,
  onOpenViewNotes,
  addNoteModalVisible,
  onCloseAddNoteModal,
  addNotePending,
  addNoteContent,
  setAddNoteContent,
  onSubmitAddNote,
  keyboardHeight,
  viewNotesModalVisible,
  onCloseViewNotes,
  allNotesLoading,
  allNotes,
  tweetId,
  deleteConfirmVisible,
  onCloseDeleteConfirm,
  deletePending,
  onDeleteConfirm,
}: TweetCardModalsProps) {
  return (
    <>
      <Modal
        visible={retweetMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={onCloseRetweetMenu}
      >
        <View style={[styles.modalOverlay, { bottom: insetsBottom }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCloseRetweetMenu} />
          <View style={[styles.bottomSheet, { backgroundColor: menuBg, borderColor }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: borderColor }]} />
            <TouchableOpacity style={styles.menuItem} onPress={onRetweet} activeOpacity={0.7}>
              <MaterialIcons
                name="repeat"
                size={22}
                color={isRetweeted ? "#00ba7c" : textColor}
              />
              <Text style={[styles.menuItemText, { color: isRetweeted ? "#00ba7c" : textColor }]}>
                {isRetweeted ? "Undo retweet" : "Retweet"}
              </Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={onQuoteTweet}
              activeOpacity={0.7}
            >
              <MaterialIcons name="format-quote" size={22} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>Quote tweet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={optionsMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={onCloseOptionsMenu}
      >
        <View style={[styles.modalOverlay, { bottom: insetsBottom }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCloseOptionsMenu} />
          <View style={[styles.bottomSheet, { backgroundColor: menuBg, borderColor }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: borderColor }]} />
            {isSelf && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={onPin}
                  disabled={pinPending}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="push-pin" size={22} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>
                    {pinPending
                      ? "Updating..."
                      : isPinned
                        ? "Unpin from profile"
                        : "Pin to profile"}
                  </Text>
                </TouchableOpacity>
                <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={onDeletePress}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="delete-outline" size={22} color="#f91880" />
                  <Text style={[styles.menuItemText, { color: "#f91880" }]}>Delete tweet</Text>
                </TouchableOpacity>
                <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
              </>
            )}
            <TouchableOpacity style={styles.menuItem} onPress={onOpenAddNote} activeOpacity={0.7}>
              <MaterialIcons name="note-add" size={22} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>Add community note</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
            <TouchableOpacity style={styles.menuItem} onPress={onOpenViewNotes} activeOpacity={0.7}>
              <MaterialIcons name="notes" size={22} color={textColor} />
              <Text style={[styles.menuItemText, { color: textColor }]}>View community notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={addNoteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !addNotePending && onCloseAddNoteModal()}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => !addNotePending && onCloseAddNoteModal()}
          />
          <View
            style={[
              styles.addNoteSheet,
              {
                backgroundColor: menuBg,
                borderColor,
                bottom: Math.max(0, keyboardHeight + insetsBottom),
                paddingBottom: insetsBottom - 20,
              },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="always"
              contentContainerStyle={styles.addNoteContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.addNoteHeader, { borderBottomColor: borderColor }]}>
                <TouchableOpacity
                  onPress={() => !addNotePending && onCloseAddNoteModal()}
                  style={styles.addNoteHeaderBtnLeft}
                >
                  <Text style={[styles.addNoteCancel, { color: "#1d9bf0" }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.addNoteTitle, { color: textColor }]}>Add community note</Text>
                <TouchableOpacity
                  onPressIn={onSubmitAddNote}
                  disabled={!addNoteContent.trim() || addNotePending}
                  style={styles.addNoteHeaderBtnRight}
                >
                  {addNotePending ? (
                    <ActivityIndicator size="small" color="#1d9bf0" />
                  ) : (
                    <Text
                      style={[
                        styles.addNoteSubmit,
                        {
                          color:
                            addNoteContent.trim() && !addNotePending
                              ? "#1d9bf0"
                              : mutedColor,
                        },
                      ]}
                    >
                      Submit
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.addNoteInput, { color: textColor, borderColor }]}
                placeholder="Write a note to add context to this tweet..."
                placeholderTextColor={mutedColor}
                value={addNoteContent}
                onChangeText={setAddNoteContent}
                multiline
                editable={!addNotePending}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={viewNotesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={onCloseViewNotes}
      >
        <View style={[styles.modalOverlay, { bottom: insetsBottom }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCloseViewNotes} />
          <View style={[styles.viewNotesSheet, { backgroundColor: menuBg, borderColor }]}>
            <View style={[styles.viewNotesHeader, { borderBottomColor: borderColor }]}>
              <TouchableOpacity onPress={onCloseViewNotes} style={styles.viewNotesClose}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
              <Text style={[styles.viewNotesTitle, { color: textColor }]}>Community notes</Text>
              <View style={styles.viewNotesClose} />
            </View>
            <ScrollView
              style={styles.viewNotesScroll}
              contentContainerStyle={styles.viewNotesScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {allNotesLoading ? (
                <View style={styles.viewNotesCenter}>
                  <ActivityIndicator size="large" color="#1d9bf0" />
                </View>
              ) : allNotes.length === 0 ? (
                <View style={styles.viewNotesCenter}>
                  <Text style={[styles.viewNotesEmpty, { color: mutedColor }]}>
                    No community notes yet. Add one from the tweet menu.
                  </Text>
                </View>
              ) : (
                [...allNotes]
                  .sort(
                    (a, b) =>
                      b.helpfulCount - a.helpfulCount ||
                      a.notHelpfulCount - b.notHelpfulCount,
                  )
                  .map((note) => (
                    <NoteCard key={note.id} note={note} tweetId={tweetId} />
                  ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deletePending && onCloseDeleteConfirm()}
      >
        <Pressable
          style={styles.modalOverlayCenter}
          onPress={() => !deletePending && onCloseDeleteConfirm()}
        >
          <View
            style={[styles.deleteConfirmBox, { backgroundColor: menuBg, borderColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.deleteConfirmTitle, { color: textColor }]}>
              Delete tweet?
            </Text>
            <Text style={[styles.deleteConfirmMessage, { color: mutedColor }]}>
              This can&apos;t be undone.
            </Text>
            <TouchableOpacity
              style={[styles.deleteConfirmBtn, styles.deleteConfirmBtnDestructive]}
              onPress={onDeleteConfirm}
              disabled={deletePending}
            >
              {deletePending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.deleteConfirmBtnTextDestructive}>Delete</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteConfirmBtn, { borderColor }]}
              onPress={() => !deletePending && onCloseDeleteConfirm()}
              disabled={deletePending}
            >
              <Text style={[styles.deleteConfirmBtnText, { color: textColor }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: { fontSize: 16, fontWeight: "500" },
  menuDivider: { height: StyleSheet.hairlineWidth },
  addNoteSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: "80%",
  },
  addNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addNoteContent: {
    flexGrow: 1,
  },
  addNoteHeaderBtnLeft: { minWidth: 70, alignItems: "flex-start" },
  addNoteHeaderBtnRight: { minWidth: 70, alignItems: "flex-end" },
  addNoteCancel: { fontSize: 16 },
  addNoteTitle: { fontSize: 18, fontWeight: "700" },
  addNoteSubmit: { fontSize: 16, fontWeight: "600" },
  addNoteInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: "top",
  },
  viewNotesSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "20%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  viewNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  viewNotesClose: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  viewNotesTitle: { fontSize: 18, fontWeight: "700" },
  viewNotesScroll: { flex: 1 },
  viewNotesScrollContent: { padding: 16, paddingBottom: 40 },
  viewNotesCenter: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  viewNotesEmpty: { fontSize: 15, textAlign: "center" },
  deleteConfirmBox: {
    alignSelf: "center",
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    maxWidth: 320,
  },
  deleteConfirmTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  deleteConfirmMessage: { fontSize: 15, lineHeight: 20, marginBottom: 24 },
  deleteConfirmBtn: {
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginBottom: 8,
    borderWidth: 1,
  },
  deleteConfirmBtnDestructive: { backgroundColor: "#f91880", borderWidth: 0 },
  deleteConfirmBtnText: { fontSize: 16, fontWeight: "700" },
  deleteConfirmBtnTextDestructive: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
